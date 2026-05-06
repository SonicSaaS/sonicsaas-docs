import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { PageActions } from './components/page-actions';

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...docsComponents,
    h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
      <>
        <PageActions />
        {docsComponents.h1!(props)}
      </>
    ),
    ...components,
  };
}
