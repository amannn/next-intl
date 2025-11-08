import { ReactNode } from "react";

export function DemoContent({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

export function CodeBlock({
  children,
  language = "tsx",
}: {
  children: string;
  language?: string;
}) {
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border">
      <code className={`text-sm font-mono text-muted-foreground language-${language}`}>
        {children}
      </code>
    </pre>
  );
}

export function Example({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}
