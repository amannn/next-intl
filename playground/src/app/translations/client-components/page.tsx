import { DemoContent, Example } from "@/app/_components/demo-content";
import { GitHubLink } from "@/app/_components/github-link";
import { PlaygroundBoundary } from "@/app/_components/playground-boundary";
import { ClientExample } from "./client-example";

export const metadata = {
  title: "Client Components - Translations",
  description: "Learn how to use translations in Client Components",
};

export default function ClientComponentsPage() {
  return (
    <PlaygroundBoundary>
      <div className="space-y-8">
        <DemoContent title="Client Components">
          <div className="space-y-4">
            <p>
              Client Components run in the browser and can use interactive
              features like hooks. With next-intl, you can use the{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm">
                useTranslations()
              </code>{" "}
              hook to access translated strings in your interactive components.
            </p>

            <div>
              <h3 className="font-semibold mb-2">When to use:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Components with interactivity (buttons, forms, etc.)</li>
                <li>Components using React hooks (useState, useEffect, etc.)</li>
                <li>Event handlers and user interactions</li>
                <li>Real-time updates and dynamic content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Usage example:</h3>
              <code className="block bg-muted p-3 rounded text-sm overflow-x-auto">
                {`'use client';\n\nimport { useTranslations } from 'next-intl';\n\nexport default function Button() {\n  const t = useTranslations();\n  \n  return <button>{t('button.label')}</button>;\n}`}
              </code>
            </div>

            <p>
              Learn more in the{" "}
              <a
                href="https://next-intl-docs.vercel.app/docs/getting-started/app-router"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                next-intl documentation
              </a>
              .
            </p>
          </div>
        </DemoContent>

        <Example title="Live Example">
          <ClientExample />
        </Example>

        <div className="pt-4 border-t border-border">
          <GitHubLink path="playground/src/app/translations/client-components" />
        </div>
      </div>
    </PlaygroundBoundary>
  );
}
