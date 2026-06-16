import {useMDXComponents} from 'nextra/mdx';
import {
  ComponentProps,
  MouseEvent,
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import useLocationHash from '@/hooks/useLocationHash';

type Props = ComponentProps<'details'>;

export default function Details({children, id, ...rest}: Props) {
  const locationHash = useLocationHash();
  const hasLoadedHash = locationHash !== undefined;
  const isActive = id === locationHash;
  const [key, resetKey] = useReducer((x) => x + 1, 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setCopied] = useState(false);

  const OriginalDetails = useMDXComponents().details as (
    props: Props
  ) => ReactNode;

  useEffect(() => {
    // Use cases:
    // 1. Open when the hash is clicked
    // 2. Anchor is clicked while open (no change)
    // 3. Details were open, another hash is clicked (no change to open)
    //
    // Therefore, we set a new key when the details
    // are activated by a hash change.

    if (isActive) {
      resetKey();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isCopied) return;
    const timerId = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  async function onAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modifier-click (⌘ on Mac, Ctrl elsewhere) copies a Markdown link that
    // uses the summary as the label, which is handy for sharing a section
    // (e.g. on GitHub). A regular click keeps the default permalink behavior.
    if (!(event.metaKey || event.ctrlKey)) return;

    event.preventDefault();

    const summary = containerRef.current
      ?.querySelector('summary')
      ?.textContent.trim();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    const markdown = summary ? `[${summary}](${url})` : url;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      console.error('Failed to copy!');
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {id && (
        <a
          aria-label="Permalink for this section"
          className="subheading-anchor absolute right-3 top-3 scroll-m-[5rem]"
          href={`#${id}`}
          id={id}
          onClick={onAnchorClick}
          title="Permalink for this section (⌘/Ctrl-click to copy as Markdown)"
        >
          {/* Styled by nextra via CSS class */}
        </a>
      )}
      {isCopied && (
        <span className="absolute right-3 top-9 z-10 rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-slate-700">
          Copied Markdown link!
        </span>
      )}
      <OriginalDetails
        key={key}
        id={id}
        open={hasLoadedHash ? isActive : undefined}
        {...rest}
      >
        {children}
      </OriginalDetails>
    </div>
  );
}
