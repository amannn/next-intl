export function PlaygroundByline() {
  return (
    <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
      <a
        className="transition-colors hover:text-foreground"
        href="https://github.com/amannn/next-intl/tree/main/playground"
        target="_blank"
        rel="noreferrer"
      >
        Source code
      </a>
      <span aria-hidden>·</span>
      <a
        className="transition-colors hover:text-foreground"
        href="https://next-intl.dev/docs/getting-started"
        target="_blank"
        rel="noreferrer"
      >
        Docs
      </a>
      <span aria-hidden>·</span>
      <a
        className="transition-colors hover:text-foreground"
        href="https://app-router.vercel.app/"
        target="_blank"
        rel="noreferrer"
      >
        Inspired by Next.js
      </a>
    </div>
  );
}
