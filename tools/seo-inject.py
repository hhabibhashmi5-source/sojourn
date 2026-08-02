# -*- coding: utf-8 -*-
"""
Sojourn — SEO tag injector (Phase 5)

Rewrites the canonical / Open Graph / Twitter / JSON-LD block in the <head>
of every PUBLIC page. Safe to re-run: it strips the old block first, so it
never duplicates tags.

USE THIS when your site URL changes (e.g. you move to a custom domain):
  1. Edit BASE below.
  2. Run:  python tools/seo-inject.py
  3. Also update frontend/robots.txt and frontend/sitemap.xml (they hardcode BASE).

Private pages (admin.html, dashboard.html) are intentionally excluded — they
stay `noindex` and out of the sitemap.
"""
import re, os, json

# ---------------------------------------------------------------- settings
BASE = "https://hhabibhashmi5-source.github.io/sojourn"   # <- change me on a domain move
OG_IMAGE = ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
            "?auto=format&fit=crop&w=1200&h=630&q=80")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND = os.path.join(ROOT, "frontend")

PAGES = {
    "index.html":        {"path": "/",                  "type": "website"},
    "destinations.html": {"path": "/destinations.html", "type": "website"},
    "destination.html":  {"path": "/destination.html",  "type": "article"},
    "journal.html":      {"path": "/journal.html",      "type": "website"},
    "article.html":      {"path": "/article.html",      "type": "article"},
    "advisory.html":     {"path": "/advisory.html",     "type": "website"},
    "booking.html":      {"path": "/booking.html",      "type": "website"},
    "itinerary.html":    {"path": "/itinerary.html",    "type": "website"},
}

ORG = {
    "@type": "TravelAgency", "@id": BASE + "/#org", "name": "Sojourn",
    "url": BASE + "/", "logo": BASE + "/assets/favicon.svg",
    "description": "A members' house for quiet luxury travel — curated escapes, editorial and bespoke advisory.",
    "sameAs": ["https://instagram.com/", "https://pinterest.com/"],
}
WEBSITE = {"@type": "WebSite", "@id": BASE + "/#website", "url": BASE + "/",
           "name": "Sojourn", "publisher": {"@id": BASE + "/#org"}}


def jsonld(name, title, desc, url):
    if name == "index.html":
        graph = [ORG, WEBSITE]
    elif name == "article.html":
        graph = [{"@type": "BlogPosting", "headline": title, "description": desc,
                  "url": url, "image": OG_IMAGE,
                  "publisher": {"@type": "Organization", "name": "Sojourn"},
                  "mainEntityOfPage": url}]
    elif name == "advisory.html":
        graph = [ORG, {"@type": "WebPage", "name": title, "description": desc, "url": url}]
    else:
        graph = [{"@type": "WebPage", "name": title, "description": desc, "url": url,
                  "isPartOf": {"@id": BASE + "/#website"}}]
    return json.dumps({"@context": "https://schema.org", "@graph": graph},
                      separators=(",", ":"), ensure_ascii=False)


STRIP_LINE = re.compile(
    r'[ \t]*<(?:link[^>]*rel="canonical"|link[^>]*rel="manifest"|'
    r'meta[^>]*property="og:[^"]*"|meta[^>]*name="twitter:[^"]*"|'
    r'meta[^>]*name="robots"|meta[^>]*name="author")[^>]*/?>\n?', re.I)
STRIP_JSONLD = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\n?', re.I | re.S)
STRIP_COMMENT = re.compile(r'[ \t]*<!-- (?:Open Graph|Canonical, social)[^>]*-->\n?', re.I)


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;') if s else s


def process(name, cfg):
    fp = os.path.join(FRONTEND, name)
    with open(fp, encoding="utf-8") as f:
        html = f.read()

    html = STRIP_COMMENT.sub('', html)
    html = STRIP_LINE.sub('', html)
    html = STRIP_JSONLD.sub('', html)

    m_title = re.search(r'<title>(.*?)</title>', html, re.S)
    m_desc = re.search(r'<meta name="description" content="(.*?)"\s*/?>', html, re.S)
    title = m_title.group(1).strip() if m_title else "Sojourn"
    desc = m_desc.group(1).strip() if m_desc else ""
    url = BASE + cfg["path"]

    block = (
        '\n  <!-- Canonical, social & structured data (Phase 5) -->\n'
        f'  <link rel="canonical" href="{url}" />\n'
        f'  <link rel="manifest" href="manifest.webmanifest" />\n'
        f'  <meta name="robots" content="index, follow" />\n'
        f'  <meta name="author" content="Sojourn" />\n'
        f'  <meta property="og:site_name" content="Sojourn" />\n'
        f'  <meta property="og:locale" content="en_US" />\n'
        f'  <meta property="og:title" content="{esc(title)}" />\n'
        f'  <meta property="og:description" content="{esc(desc)}" />\n'
        f'  <meta property="og:type" content="{cfg["type"]}" />\n'
        f'  <meta property="og:url" content="{url}" />\n'
        f'  <meta property="og:image" content="{OG_IMAGE}" />\n'
        f'  <meta property="og:image:width" content="1200" />\n'
        f'  <meta property="og:image:height" content="630" />\n'
        f'  <meta name="twitter:card" content="summary_large_image" />\n'
        f'  <meta name="twitter:title" content="{esc(title)}" />\n'
        f'  <meta name="twitter:description" content="{esc(desc)}" />\n'
        f'  <meta name="twitter:image" content="{OG_IMAGE}" />\n'
        f'  <script type="application/ld+json">{jsonld(name, title, desc, url)}</script>'
    )

    anchor = '<meta name="theme-color" content="#1C1A17" />'
    if anchor in html:
        html = html.replace(anchor, anchor + block, 1)
    else:
        html = html.replace('</head>', block + '\n</head>', 1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    return title


if __name__ == "__main__":
    for name, cfg in PAGES.items():
        t = process(name, cfg)
        print("OK  %-20s <- %s" % (name, t[:44]))
    print("\nDone: %d pages. Remember to update robots.txt + sitemap.xml too." % len(PAGES))
