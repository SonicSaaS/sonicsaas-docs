import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { PrintButton } from './components/print-button';

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...docsComponents,
    h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
      <>
        <PrintButton />
        {docsComponents.h1!(props)}
      </>
    ),
    ...components,
  };
}
