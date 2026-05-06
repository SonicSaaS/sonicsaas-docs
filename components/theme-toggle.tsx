'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ORDER = ['light', 'dark', 'system'] as const;
type ThemeName = (typeof ORDER)[number];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current: ThemeName = mounted && (ORDER as readonly string[]).includes(theme ?? '')
    ? (theme as ThemeName)
    : 'system';

  const next = () => {
    const i = ORDER.indexOf(current);
    setTheme(ORDER[(i + 1) % ORDER.length]);
  };

  const Icon = current === 'dark' ? Moon : current === 'light' ? Sun : Monitor;
  const label = `Theme: ${current} (click to cycle)`;

  return (
    <button
      type="button"
      onClick={next}
      aria-label={label}
      title={label}
      className="nextra-button x:flex x:items-center x:justify-center x:rounded-md x:p-2 x:text-current x:transition x:hover:bg-gray-100 x:dark:hover:bg-neutral-800"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
