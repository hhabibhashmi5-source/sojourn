/** @type {import('next').NextConfig} */

// Static export so the site deploys as plain files (GitHub Pages / Netlify),
// exactly like the vanilla build it replaces — no Node server needed.
//
// basePath: GitHub Pages serves this repo as a *project site* under /sojourn,
// so the production build sets NEXT_PUBLIC_BASE_PATH=/sojourn. Local dev and
// Netlify (root domain) leave it empty. Everything else reads the same value.
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true }, // required for `output: export`
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // This app is its own project (has its own lockfile); pin the tracing root so
  // Next doesn't pick the parent repo's lockfile.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
