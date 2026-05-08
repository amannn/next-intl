// TODO (Phase D): replace with MDX-based content
import { GitHubLink } from "@/components/playground/github-link";
import { PlaygroundBoundary } from "@/components/playground/boundary";
import { ServerExample } from "./server-example";

export const metadata = {
  title: "Server Components - Translations",
  description: "Learn how to use translations in Server Components",
};

export default function ServerComponentsPage() {
  return (
    <PlaygroundBoundary>
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Server Components</h2>
          <p>
            Server Components are components that render exclusively on the
            server. With next-intl, you can seamlessly use the{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">
              useTranslations()
            </code>{" "}
            hook to access translated strings.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Live Example</h3>
          <div className="bg-card border border-border rounded-lg p-4">
            <ServerExample />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <GitHubLink path="playground/src/app/[locale]/translations/server-components" />
        </div>
      </div>
    </PlaygroundBoundary>
  );
}
