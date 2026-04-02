import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import 'nextra-theme-docs/style.css';
import './print.css';
import './theme.css';
import { ThemeSync } from '../components/theme-sync';

const manrope = Manrope({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

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
    logo={
      <a href="https://sonicsaas.com" className="flex items-center !no-underline">
        <Shield className="h-6 w-6 text-[var(--brand)]" />
        <span className="ml-2 text-xl font-semibold">SonicSaaS</span>
      </a>
    }
    logoLink={false}
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
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${manrope.className} ${jetbrainsMono.variable}`}>
      <Head
        color={{
          hue: { light: 24, dark: 24 },
          saturation: { light: 94, dark: 90 },
          lightness: { light: 50, dark: 55 },
        }}
        backgroundColor={{
          light: 'rgb(255,255,255)',
          dark: 'rgb(10,10,10)',
        }}
      />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/SonicSaaS/sonicsaas-docs/tree/master"
          editLink="Edit this page on GitHub"
          sidebar={{
            defaultMenuCollapseLevel: 1,
            autoCollapse: true,
          }}
        >
          <ThemeSync />
          {children}
        </Layout>
      </body>
    </html>
  );
}
