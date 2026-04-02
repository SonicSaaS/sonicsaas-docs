'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

const COOKIE_NAME = 'sonicsaas-theme';
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.sonicsaas.com';

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, domain: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; domain=${domain}; path=/; max-age=31536000; SameSite=Lax; Secure`;
}

export function ThemeSync() {
  const { theme, setTheme } = useTheme();

  // On mount: read shared cookie, sync if different from current theme
  useEffect(() => {
    const cookieTheme = getCookie(COOKIE_NAME);
    if (cookieTheme && cookieTheme !== theme) {
      setTheme(cookieTheme);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On theme change: write shared cookie so other subdomains pick it up
  useEffect(() => {
    if (theme) {
      setCookie(COOKIE_NAME, theme, COOKIE_DOMAIN);
    }
  }, [theme]);

  return null;
}
