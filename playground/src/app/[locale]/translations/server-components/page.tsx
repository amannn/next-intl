import { DemoContent, Example } from "@/app/_components/demo-content";
import { GitHubLink } from "@/app/_components/github-link";
import { PlaygroundBoundary } from "@/app/_components/playground-boundary";
import { ServerExample } from "./server-example";

export const metadata = {
  title: "Server Components - Translations",
  description: "Learn how to use translations in Server Components",
};

export default function ServerComponentsPage() {
  return (
    <PlaygroundBoundary>
      <div className="space-y-8">
        <DemoContent title="Server Components">
          <div className="space-y-4">
            <p>
              Server Components are components that render exclusively on the
              server. With next-intl, you can seamlessly use the{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm">
                useTranslations()
              </code>{" "}
              hook to access translated strings.
            </p>

            <div>
              <h3 className="font-semibold mb-2">Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Messages are only sent to the server, reducing bundle size</li>
                <li>No client-side hydration overhead</li>
                <li>Better performance and faster page loads</li>
                <li>Ideal for static content and page layouts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Usage example:</h3>
              <code className="block bg-muted p-3 rounded text-sm overflow-x-auto">
                {`import { useTranslations } from 'next-intl';\n\nexport default function Page() {\n  const t = useTranslations();\n  return <h1>{t('welcome.title')}</h1>;\n}`}
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
          <ServerExample />
        </Example>

        <div className="pt-4 border-t border-border">
          <GitHubLink path="playground/src/app/translations/server-components" />
        </div>
      </div>
    </PlaygroundBoundary>
  );
}
