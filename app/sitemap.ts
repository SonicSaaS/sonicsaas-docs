import type { MetadataRoute } from 'next';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const dynamic = 'force-static';

const BASE_URL = 'https://docs.sonicsaas.com';
const CONTENT_DIR = join(process.cwd(), 'content');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // No `lastModified`: a build-time `new Date()` stamps every page with the same
  // date on every build — an unverifiable freshness signal Google learns to
  // distrust. Omitting it is honest. (Accurate per-file dates would require the
  // git commit date + a full-history checkout; revisit if that signal is wanted.)
  // changeFrequency/priority are kept but note Google ignores both.
  return walk(CONTENT_DIR).map((file) => {
    const rel = relative(CONTENT_DIR, file).split(sep).join('/').replace(/\.mdx$/, '');
    const path = rel === 'index' ? '' : rel.replace(/\/index$/, '');
    return {
      // Root emitted without a trailing slash to match the homepage canonical
      // (metadataBase resolves "/" to the bare origin). Keeps sitemap <loc> and
      // <link rel=canonical> byte-identical.
      url: path ? `${BASE_URL}/${path}` : BASE_URL,
      changeFrequency: 'weekly',
      priority: path === '' ? 1.0 : 0.7,
    };
  });
}
