// =========================================================
// Sojourn — AI Itinerary generator (Supabase Edge Function)
// Runs on Deno. Calls the Claude API server-side so the
// ANTHROPIC_API_KEY is NEVER exposed to the browser.
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy itinerary --no-verify-jwt
//
// Called from frontend/js/itinerary.js.
// =========================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

// CORS — allow the browser (any origin; tighten to your domain if you prefer).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

// The shape we ask Claude to return, so the page can render it safely.
const ITINERARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "overview", "days", "tips"],
  properties: {
    title: { type: "string" },
    overview: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "morning", "afternoon", "evening"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          morning: { type: "string" },
          afternoon: { type: "string" },
          evening: { type: "string" },
        },
      },
    },
    tips: { type: "array", items: { type: "string" } },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "Server not configured (missing ANTHROPIC_API_KEY)." }, 500);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  // ---- Validate + clamp inputs (caps limit abuse of a public endpoint) ----
  const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const destination = clip(body.destination, 80);
  const days = Math.min(Math.max(parseInt(String(body.days ?? "0"), 10) || 0, 1), 14);
  const month = clip(body.month, 30);
  const interests = clip(body.interests, 200);
  const pace = clip(body.pace, 30) || "balanced";
  const travelers = clip(body.travelers, 40);
  const budget = clip(body.budget, 40);
  const notes = clip(body.notes, 400);

  if (!destination) return json({ error: "Please provide a destination." }, 400);

  const system =
    "You are the head travel advisor at Sojourn, a quiet-luxury travel house. " +
    "You craft refined, tasteful day-by-day itineraries: understated luxury, " +
    "authentic local experiences, excellent food, and thoughtful pacing over rushing. " +
    "Be specific and evocative but concise. Recommend real, well-known kinds of places " +
    "and neighbourhoods; do not invent exact business names, prices, or addresses. " +
    "Do not include internal or system XML tags in your response.";

  const prompt =
    `Create a ${days}-day luxury travel itinerary.\n` +
    `Destination: ${destination}\n` +
    (month ? `Travel period: ${month}\n` : "") +
    (travelers ? `Travellers: ${travelers}\n` : "") +
    (budget ? `Budget level: ${budget}\n` : "") +
    `Pace: ${pace}\n` +
    (interests ? `Interests: ${interests}\n` : "") +
    (notes ? `Additional notes: ${notes}\n` : "") +
    `\nReturn a title, a short overview (2-3 sentences), one entry per day with morning/afternoon/evening ` +
    `plans (each 1-2 sentences), and 3-5 short practical tips.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 4000,
        thinking: { type: "adaptive" },
        output_config: {
          effort: "low", // fast + economical for a web request; raise for richer plans
          format: { type: "json_schema", schema: ITINERARY_SCHEMA },
        },
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[Sojourn] Anthropic error:", res.status, detail);
      return json({ error: "The advisor is unavailable right now. Please try again shortly." }, 502);
    }

    const data = await res.json();

    if (data.stop_reason === "refusal") {
      return json({ error: "That request couldn't be completed. Please adjust the details and try again." }, 422);
    }

    // Pull the JSON payload out of the text block(s).
    const text = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

    let itinerary: unknown;
    try {
      itinerary = JSON.parse(text);
    } catch {
      console.error("[Sojourn] could not parse model JSON:", text.slice(0, 500));
      return json({ error: "The advisor returned an unexpected format. Please try again." }, 502);
    }

    return json({ itinerary });
  } catch (err) {
    console.error("[Sojourn] itinerary function error:", err);
    return json({ error: "Something went wrong generating your itinerary." }, 500);
  }
});
