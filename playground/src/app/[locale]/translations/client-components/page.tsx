// TODO (Phase D): replace with MDX-based content
import { GitHubLink } from "@/components/playground/github-link";
import { PlaygroundBoundary } from "@/components/playground/boundary";
import { ClientExample } from "./client-example";

export const metadata = {
  title: "Client Components - Translations",
  description: "Learn how to use translations in Client Components",
};

export default function ClientComponentsPage() {
  return (
    <PlaygroundBoundary>
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Client Components</h2>
          <p>
            Client Components run in the browser and can use interactive
            features like hooks. With next-intl, you can use the{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">
              useTranslations()
            </code>{" "}
            hook to access translated strings in your interactive components.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Live Example</h3>
          <div className="bg-card border border-border rounded-lg p-4">
            <ClientExample />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <GitHubLink path="playground/src/app/[locale]/translations/client-components" />
        </div>
      </div>
    </PlaygroundBoundary>
  );
}
