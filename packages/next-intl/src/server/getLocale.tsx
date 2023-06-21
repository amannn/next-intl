import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarned = false;

export default function getLocale() {
  if (!hasWarned) {
    console.warn(`
\`getLocale\` is deprecated. Please use the \`locale\` parameter from Next.js instead:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  // Use \`params.locale\` here
}

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`);
    hasWarned = true;
  }

  return getLocaleFromHeader();
}
