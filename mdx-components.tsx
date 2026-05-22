import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { PageActions } from './components/page-actions';
import { PagefindTags } from './components/pagefind-tags';

const docsComponents = getDocsMDXComponents();
const DocsWrapper = docsComponents.wrapper!;

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...docsComponents,
    wrapper: ({ children, metadata, ...rest }: Parameters<typeof DocsWrapper>[0]) => (
      <DocsWrapper metadata={metadata} {...rest}>
        <PagefindTags
          filePath={metadata.filePath}
          keywords={(metadata as { keywords?: string | string[] }).keywords}
        />
        {children}
      </DocsWrapper>
    ),
    h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
      <>
        <PageActions />
        {docsComponents.h1!(props)}
      </>
    ),
    ...components,
  };
}
