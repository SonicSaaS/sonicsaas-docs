import sectionMeta from '../content/_meta';

const SECTION_LABELS = sectionMeta as Record<string, string>;

function deriveSectionFromFilePath(filePath: string): string | null {
  const normalized = filePath.replace(/^(\.\/)?(src\/)?content\//, '');
  const slug = normalized.split('/')[0]?.replace(/\.mdx?$/, '');
  if (!slug || slug === 'index.mdx' || slug === 'index') return null;
  return SECTION_LABELS[slug] ?? null;
}

type Keywords = string | string[] | undefined;

function normalizeKeywords(keywords: Keywords): string | null {
  if (!keywords) return null;
  if (Array.isArray(keywords)) return keywords.filter(Boolean).join(' ');
  return keywords;
}

export function PagefindTags({
  filePath,
  keywords,
}: {
  filePath: string;
  keywords?: Keywords;
}) {
  const section = deriveSectionFromFilePath(filePath);
  const kw = normalizeKeywords(keywords);
  if (!section && !kw) return null;
  return (
    <>
      {section && (
        <div data-pagefind-filter={`section:${section}`} hidden aria-hidden="true" />
      )}
      {kw && (
        <div data-pagefind-meta="keywords" hidden aria-hidden="true">
          {kw}
        </div>
      )}
    </>
  );
}
