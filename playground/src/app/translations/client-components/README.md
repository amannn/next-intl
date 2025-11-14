# Client Components

Client Components are interactive components that run in the browser. With next-intl, you can use the `useTranslations()` hook to access translations in your Client Components.

## How it works

In Client Components, you can:
- Use the `useTranslations()` hook to get translated strings
- Access locale information with `useLocale()`
- Provide interactivity while maintaining full i18n support
- Dynamically update content based on user interactions

## Example usage

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations();
  
  return (
    <button onClick={() => console.log(t('button.label'))}>
      {t('button.label')}
    </button>
  );
}
```

Learn more in the [next-intl documentation](https://next-intl-docs.vercel.app).
