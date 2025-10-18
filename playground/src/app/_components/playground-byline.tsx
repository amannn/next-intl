import { PlaygroundBoundary } from "./playground-boundary";


export default function PlaygroundByline() {
  return (
    <PlaygroundBoundary>
      <div className="flex gap-4 text-sm font-medium">
        <a
          className="transition-colors hover:text-foreground"
          href="https://github.com/your/repo"
          target="_blank"
          rel="noreferrer"
        >
          Source code
        </a>
        <span className="text-foreground">/</span>
        <a
          className="transition-colors hover:text-foreground"
          href="https://next-intl.dev/docs/getting-started"
          target="_blank"
          rel="noreferrer"
        >
          Docs
        </a>
        <span className="text-foreground">/</span>
        <a
          className="transition-colors hover:text-foreground"
          href="https://app-router.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Inspired by Next.js
        </a>
      </div>
    </PlaygroundBoundary>
  );
}
