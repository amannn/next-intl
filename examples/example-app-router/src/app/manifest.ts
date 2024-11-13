import {MetadataRoute} from 'next';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // const t = await getTranslations('Manifest');

  return {
    // InvariantError: Invariant: Missing Client Reference Manifest for /manifest.webmanifest. This is a bug in Next.js.
    // name: t('name'),
    start_url: '/',
    theme_color: '#101E33'
  };
}
