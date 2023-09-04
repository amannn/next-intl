import useRouter from '../client/useRouter';

// TODO: Only available for backwards compatibility
// during the beta, remove for stable release

let hasWarned = false;

export default function useLocalizedRouterDeprecated() {
  if (process.env.NODE_ENV !== 'production' && !hasWarned) {
    console.warn(
      `\n\nDEPRECATION WARNING: The \`useLocalizedRouter\` import from \`next-intl\` is deprecated and will be removed in the stable release of next-intl. Please import \`useLocalizedRouter\` from \`next-intl/client\` instead. See https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components\n\n`
    );
    hasWarned = true;
  }

  return useRouter();
}
