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
  const now = new Date();
  return walk(CONTENT_DIR).map((file) => {
    const rel = relative(CONTENT_DIR, file).split(sep).join('/').replace(/\.mdx$/, '');
    const path = rel === 'index' ? '' : rel.replace(/\/index$/, '');
    return {
      url: path ? `${BASE_URL}/${path}` : `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '' ? 1.0 : 0.7,
    };
  });
}
