import type { Metadata } from 'next';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { ReactNode } from 'react';
import 'nextra-theme-docs/style.css';
import './print.css';
import { ThemeSync } from '../components/theme-sync';

export const metadata: Metadata = {
  title: {
    default: 'SonicSaaS Documentation',
    template: '%s — SonicSaaS Docs',
  },
  description:
    'Documentation for SonicSaaS — secure fleet management for MSPs.',
};

const navbar = (
  <Navbar
    logo={<span className="font-bold">SonicSaaS Docs</span>}
    projectLink="https://github.com/SonicSaaS/sonicsaas-docs"
  />
);

const footer = (
  <Footer>
    <span>
      {new Date().getFullYear()} © SonicSaaS. Built with{' '}
      <a href="https://nextra.site" target="_blank" rel="noopener noreferrer">
        Nextra
      </a>
      .
    </span>
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/SonicSaaS/sonicsaas-docs/tree/master"
          editLink="Edit this page on GitHub"
        >
          <ThemeSync />
          {children}
        </Layout>
      </body>
    </html>
  );
}
