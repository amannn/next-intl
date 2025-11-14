"use client";

import { Github } from "lucide-react";
import Link from "next/link";

export function GitHubLink({
  path = "playground/src/app",
}: {
  path?: string;
} = {}) {
  const url = `https://github.com/amannn/next-intl/tree/main/${path}`;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Github className="w-4 h-4" />
      View on GitHub
    </Link>
  );
}
