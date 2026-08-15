// GitHub Pages serves this repo under /sojourn, so static assets referenced by
// raw <img>/<link> (not next/link, which prefixes automatically) need the base
// path prepended. Set via NEXT_PUBLIC_BASE_PATH at build time.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Prefix a site-absolute asset path (e.g. "/assets/favicon.svg").
export const asset = (p) => `${BASE_PATH}${p}`;
