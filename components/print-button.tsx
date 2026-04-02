'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      data-print-button
      className="print-button inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-neutral-700 dark:text-gray-400 dark:hover:border-neutral-500 dark:hover:text-gray-200"
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
  );
}
