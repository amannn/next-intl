'use client';

import { _useExtracted as useExtracted } from 'use-intl/react';
import type { ReactNode } from 'react';

interface GreetingProps {
  readonly name: string;
  readonly unreadCount?: number;
  /**
   * The component is renderer-agnostic — the consumer decides what HTML/native
   * element a `<text>` chunk becomes. The mobile app passes `<Text/>` from
   * `react-native`; the web app passes `<span/>`.
   */
  readonly Text: (props: { readonly children: ReactNode }) => ReactNode;
  readonly Strong: (props: { readonly children: ReactNode }) => ReactNode;
}

/**
 * Cross-platform greeting card. The strings here are extracted by both apps
 * because each `metro.config.js`/`next.config.ts` includes `../../packages/ui/src`
 * in its `srcPath`.
 */
export function Greeting({ name, unreadCount = 0, Text, Strong }: GreetingProps) {
  const t = useExtracted('shared-ui.greeting');

  // Note: we deliberately avoid ICU `{count, plural, …}` here because Hermes
  // (the JS engine bundled with Expo) ships without `Intl.PluralRules` on
  // some platforms — calling plural format would throw a `FORMATTING_ERROR`.
  // For apps that need real plural rules, install `@formatjs/intl-pluralrules`
  // and import it in your entry before the IntlProvider is rendered.
  return (
    <Text>
      {t("Hej på dig  ")}
      {t.rich('Hello <strong>{name}</strong>, you have {count} unread messages.', {
        name,
        count: unreadCount,
        strong: (chunks) => <Strong>{chunks}</Strong>
      })}
    </Text>
  );
}
