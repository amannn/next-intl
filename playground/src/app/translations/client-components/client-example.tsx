"use client";

import { useState } from "react";

export function ClientExample() {
  const [count, setCount] = useState(0);

  // This simulates using translations in a client component
  // In a real scenario with next-intl configured, you would use:
  // const t = useTranslations();

  const messages: Record<string, string> = {
    greeting: "Welcome to Client Components!",
    description: "This is an interactive example",
    button: "Click me",
    count: `You've clicked the button ${count} times`,
    reset: "Reset",
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-semibold text-foreground">
          {messages.greeting}
        </p>
        <p className="text-sm text-muted-foreground">
          {messages.description}
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setCount(count + 1)}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          {messages.button}
        </button>

        <div className="text-center">
          <p className="text-sm text-foreground mb-2">{messages.count}</p>
          {count > 0 && (
            <button
              onClick={() => setCount(0)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {messages.reset}
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
        ℹ️ This component uses React hooks like{" "}
        <code className="bg-background px-1 rounded">useState</code> which only
        work in Client Components.
      </div>
    </div>
  );
}
