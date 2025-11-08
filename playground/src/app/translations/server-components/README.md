# Server Components

Server Components are components that render on the server. With next-intl, you can use the `useTranslations()` hook to get translated strings in your Server Components.

## How it works

In Server Components, you can:
- Import messages from your i18n configuration
- Use translations directly without client-side hydration
- Benefit from better performance as rendering happens on the server

## Example usage

```tsx
import { useTranslations } from 'next-intl';

export default function ServerPage() {
  const t = useTranslations();
  
  return <h1>{t('welcome.title')}</h1>;
}
```

Learn more in the [next-intl documentation](https://next-intl-docs.vercel.app).
