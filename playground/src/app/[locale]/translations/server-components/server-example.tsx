export function ServerExample() {
  // This simulates using translations in a server component
  // In a real scenario with next-intl configured, you would use:
  // const t = useTranslations();
  
  const exampleMessages = {
    welcome: "Welcome to next-intl",
    description: "This page demonstrates translations in Server Components",
    feature1: "✓ Server-side rendering",
    feature2: "✓ No client-side hydration needed",
    feature3: "✓ Better performance",
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-foreground">
          {exampleMessages.welcome}
        </p>
        <p className="text-sm text-muted-foreground">
          {exampleMessages.description}
        </p>
      </div>

      <ul className="space-y-2">
        {[exampleMessages.feature1, exampleMessages.feature2, exampleMessages.feature3].map(
          (feature, idx) => (
            <li key={idx} className="text-sm text-foreground">
              {feature}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
