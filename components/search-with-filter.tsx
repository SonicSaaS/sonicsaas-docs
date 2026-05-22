'use client';

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import cn from 'clsx';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';

const STORAGE_KEY = 'docs-search-section';
const INPUTS = new Set(['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']);

type PagefindSubResult = {
  url: string;
  title: string;
  excerpt: string;
};

type PagefindResultData = {
  url: string;
  meta: { title: string };
  excerpt: string;
  sub_results: PagefindSubResult[];
};

type PagefindModule = {
  options: (opts: Record<string, unknown>) => Promise<void>;
  filters: () => Promise<Record<string, Record<string, number>>>;
  debouncedSearch: (
    query: string,
    options?: { filters?: Record<string, string | string[]> }
  ) => Promise<{
    results: { data: () => Promise<PagefindResultData> }[];
  } | null>;
};

declare global {
  interface Window {
    pagefind?: PagefindModule;
  }
}

let pagefindLoadPromise: Promise<PagefindModule> | null = null;

async function loadPagefind(): Promise<PagefindModule> {
  if (window.pagefind) return window.pagefind;
  if (!pagefindLoadPromise) {
    pagefindLoadPromise = (async () => {
      const mod = (await import(
        /* webpackIgnore: true */ '/_pagefind/pagefind.js' as string
      )) as PagefindModule;
      await mod.options({ baseUrl: '/' });
      window.pagefind = mod;
      return mod;
    })();
  }
  return pagefindLoadPromise;
}

function readStoredSection(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredSection(value: string | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, value);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const cleanUrl = (raw: string) =>
  raw.replace(/\.html$/, '').replace(/\.html#/, '#');

// Pagefind returns excerpts where matched terms are wrapped in literal <mark>...</mark>
// strings. Render those safely as React <mark> elements without dangerouslySetInnerHTML.
const MARK_SPLIT_RE = /<mark>(.*?)<\/mark>/g;
function renderExcerpt(raw: string): React.ReactNode {
  if (!raw.includes('<mark>')) return raw;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of raw.matchAll(MARK_SPLIT_RE)) {
    if (match.index! > lastIndex) parts.push(raw.slice(lastIndex, match.index!));
    parts.push(<mark key={key++}>{match[1]}</mark>);
    lastIndex = match.index! + match[0].length;
  }
  if (lastIndex < raw.length) parts.push(raw.slice(lastIndex));
  return parts;
}

export function SearchWithFilter({
  className,
  placeholder = 'Search documentation…',
}: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [results, setResults] = useState<PagefindResultData[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSelectedSection(readStoredSection());
  }, []);

  const loadFilters = useCallback(async () => {
    if (sections.length || error) return;
    try {
      const pf = await loadPagefind();
      const filters = await pf.filters();
      const sectionFilter = filters?.section ?? {};
      setSections(Object.keys(sectionFilter).sort());
    } catch {
      // Filters are optional — silent failure preserves base search.
    }
  }, [sections.length, error]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!deferredSearch) {
        setResults([]);
        setError('');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const pf = await loadPagefind();
        const opts = selectedSection
          ? { filters: { section: selectedSection } }
          : undefined;
        const response = await pf.debouncedSearch(deferredSearch, opts);
        if (cancelled || !response) return;
        const data = await Promise.all(response.results.map((r) => r.data()));
        if (cancelled) return;
        setResults(
          data.map((d) => ({
            ...d,
            sub_results: d.sub_results.map((s) => ({ ...s, url: cleanUrl(s.url) })),
          }))
        );
        setError('');
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? process.env.NODE_ENV !== 'production' &&
              err.message.includes('Failed to fetch')
              ? "Search isn't available in development. Run `next build` then `next start`."
              : `${err.constructor.name}: ${err.message}`
            : String(err);
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [deferredSearch, selectedSection]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || INPUTS.has(el.tagName) || el.isContentEditable) return;
      const isMac =
        typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
      const cmdK =
        event.key === 'k' &&
        !event.shiftKey &&
        (isMac ? event.metaKey : event.ctrlKey);
      if (event.key === '/' || cmdK) {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = useCallback(
    (subResult: PagefindSubResult | null) => {
      if (!subResult) return;
      inputRef.current?.blur();
      const [url, hash] = subResult.url.split('#');
      if (location.pathname === url) {
        location.href = `#${hash ?? ''}`;
      } else {
        router.push(subResult.url);
      }
      setSearch('');
    },
    [router]
  );

  const toggleSection = (name: string | null) => {
    const next = name === selectedSection ? null : name;
    setSelectedSection(next);
    writeStoredSection(next);
  };

  const handleFocus = (event: React.FocusEvent) => {
    const isFocus = event.type === 'focus';
    setFocused(isFocus);
    if (isFocus) loadFilters();
  };

  const shortcutHint = mounted && (
    <kbd
      className={cn(
        'x:absolute x:my-1.5 x:select-none x:pointer-events-none x:end-1.5 x:transition-all',
        'x:h-5 x:rounded x:bg-nextra-bg x:px-1.5 x:font-mono x:text-[11px] x:font-medium x:text-gray-600 x:dark:text-gray-400',
        'x:border nextra-border',
        'x:items-center x:gap-1 x:flex',
        'x:max-sm:hidden not-prose',
        focused && 'x:invisible x:opacity-0'
      )}
    >
      {navigator.userAgent.includes('Mac') ? (
        <>
          <span className="x:text-xs">{'⌘'}</span>K
        </>
      ) : (
        'CTRL K'
      )}
    </kbd>
  );

  const inputClasses = (focus: boolean) =>
    cn(
      'x:rounded-lg x:px-3 x:py-2 x:transition-all',
      'x:w-full x:md:w-64',
      'x:text-base x:leading-tight x:md:text-sm',
      focus
        ? 'x:bg-transparent x:nextra-focus'
        : 'x:bg-black/[.05] x:dark:bg-gray-50/10',
      'x:placeholder:text-gray-600 x:dark:placeholder:text-gray-400',
      'x:[&::-webkit-search-cancel-button]:appearance-none'
    );

  const optionsClasses = cn(
    'nextra-search-results',
    'nextra-scrollbar x:max-md:h-full',
    'x:border x:border-gray-200 x:text-gray-100 x:dark:border-neutral-800',
    'x:z-30 x:rounded-xl x:py-2.5 x:shadow-xl',
    'x:backdrop-blur-md x:bg-nextra-bg/70',
    'x:motion-reduce:transition-none',
    'x:origin-top x:transition x:duration-200 x:ease-out x:data-closed:scale-95 x:data-closed:opacity-0 x:empty:invisible',
    error || isLoading || !results.length
      ? 'x:md:min-h-28 x:flex x:flex-col x:text-sm x:gap-2'
      : 'x:md:max-h-[min(calc(100vh-5rem),400px)]!',
    'x:w-full x:md:w-[576px]'
  );

  const filterChipRow = sections.length > 0 && (
    <div className="x:flex x:flex-wrap x:gap-1.5 x:px-3 x:pb-2 x:pt-1 x:border-b x:border-black/10 x:dark:border-white/10">
      <FilterChip
        label="All"
        active={selectedSection === null}
        onClick={() => toggleSection(null)}
      />
      {sections.map((name) => (
        <FilterChip
          key={name}
          label={name}
          active={selectedSection === name}
          onClick={() => toggleSection(name)}
        />
      ))}
    </div>
  );

  const resultBody = error ? (
    <div className="x:px-3 x:py-2 x:text-red-500">{error}</div>
  ) : isLoading ? (
    <div className="x:px-3 x:py-2 x:text-gray-400">Loading…</div>
  ) : results.length ? (
    results.map((r) => <Result key={r.url} data={r} />)
  ) : deferredSearch ? (
    <div className="x:px-3 x:py-2 x:text-gray-400">No results found.</div>
  ) : null;

  return (
    <Combobox onChange={handleSelect}>
      <div
        className={cn(
          'nextra-search',
          'x:relative x:flex x:items-center',
          'x:text-gray-900 x:dark:text-gray-300',
          className
        )}
      >
        <ComboboxInput
          spellCheck={false}
          autoComplete="off"
          type="search"
          ref={inputRef}
          className={({ focus }: { focus: boolean }) => inputClasses(focus)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(event.currentTarget.value)
          }
          onFocus={handleFocus}
          onBlur={handleFocus}
          value={search}
          placeholder={placeholder}
        />
        {shortcutHint}
      </div>
      <ComboboxOptions
        transition
        anchor={{ to: 'top end', gap: 10, padding: 16 }}
        className={optionsClasses}
      >
        {filterChipRow}
        <div className="x:flex x:flex-col">{resultBody}</div>
      </ComboboxOptions>
    </Combobox>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'x:rounded-full x:border x:px-2.5 x:py-0.5 x:text-xs x:font-medium x:transition-colors',
        active
          ? 'x:bg-primary-500/10 x:text-primary-600 x:border-primary-500/40'
          : 'x:border-black/10 x:text-gray-600 x:hover:bg-black/5 x:dark:border-white/10 x:dark:text-gray-300 x:dark:hover:bg-white/5'
      )}
    >
      {label}
    </button>
  );
}

function Result({ data }: { data: PagefindResultData }) {
  return (
    <Fragment>
      <div className="x:mx-2.5 x:mb-2 x:not-first:mt-6 x:select-none x:border-b x:border-black/10 x:px-2.5 x:pb-1.5 x:text-xs x:font-semibold x:uppercase x:text-gray-600 x:dark:border-white/20 x:dark:text-gray-300">
        {data.meta.title}
      </div>
      {data.sub_results.map((sub) => (
        <ComboboxOption
          key={sub.url}
          as={NextLink}
          value={sub}
          href={sub.url}
          className={({ focus }: { focus: boolean }) =>
            cn(
              'x:mx-2.5 x:break-words x:rounded-md',
              focus
                ? 'x:text-primary-600 x:bg-primary-500/10'
                : 'x:text-gray-800 x:dark:text-gray-300',
              'x:block x:scroll-m-12 x:px-2.5 x:py-2'
            )
          }
        >
          <div className="x:text-base x:font-semibold x:leading-5">{sub.title}</div>
          <div className="x:mt-1 x:text-sm x:leading-[1.35rem] x:text-gray-600 x:dark:text-gray-400 x:[&_mark]:bg-primary-600/80 x:[&_mark]:text-white">
            {renderExcerpt(sub.excerpt)}
          </div>
        </ComboboxOption>
      ))}
    </Fragment>
  );
}
