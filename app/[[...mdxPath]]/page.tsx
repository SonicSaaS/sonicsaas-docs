import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents } from '../../mdx-components';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  // Self-referencing canonical. The path MUST match the sitemap's <loc> form
  // (app/sitemap.ts): index route -> "/", every other route -> "/seg/seg" with
  // NO trailing slash. metadataBase (app/layout.tsx) resolves this to absolute.
  // Merge into Nextra's metadata so its per-page OG/frontmatter isn't clobbered.
  const canonical = params.mdxPath?.length
    ? `/${params.mdxPath.join('/')}`
    : '/';
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical },
  };
}

const Wrapper = useMDXComponents().wrapper!;

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, toc, metadata } = result;
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode="">
      <MDXContent />
    </Wrapper>
  );
}
