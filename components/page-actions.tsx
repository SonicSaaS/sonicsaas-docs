'use client';

import { useState } from 'react';

type CopyState = 'idle' | 'ok' | 'fail';

const buttonClass =
  'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400 dark:hover:border-neutral-500 dark:hover:text-gray-200';

export function PageActions() {
  const [copied, setCopied] = useState<CopyState>('idle');

  async function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    const article = e.currentTarget.closest('article') as HTMLElement | null;
    const text = article?.innerText ?? '';

    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }

    setCopied(ok ? 'ok' : 'fail');
    setTimeout(() => setCopied('idle'), 1500);
  }

  const copyLabel = copied === 'ok' ? 'Copied!' : copied === 'fail' ? 'Failed' : 'Copy';

  return (
    <div data-page-actions>
      <button
        type="button"
        onClick={handleCopy}
        className={buttonClass}
        title="Copy page contents to clipboard"
        aria-live="polite"
      >
        {copied === 'ok' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
        )}
        {copyLabel}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className={buttonClass}
        title="Print this page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect width="12" height="8" x="6" y="14" />
        </svg>
        Print
      </button>
    </div>
  );
}
