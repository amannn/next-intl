import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarned = false;

export default function getLocale() {
  if (process.env.NODE_ENV !== 'production' && !hasWarned) {
    console.warn(`
\`getLocale\` is deprecated. Please use the \`locale\` parameter from Next.js instead:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  // Use \`params.locale\` here
}

Learn more: https://next-intl-docs.vercel.app/docs/environments/metadata-route-handlers
`);
    hasWarned = true;
  }

  return getLocaleFromHeader();
}
