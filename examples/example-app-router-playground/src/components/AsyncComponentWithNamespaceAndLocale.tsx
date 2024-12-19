import {getTranslations} from 'next-intl/server';

export default async function AsyncComponentWithNamespaceAndLocale() {
  const t = await getTranslations('AsyncComponent');

  return (
    <div data-testid="AsyncComponentWithoutNamespaceAndLocale">
      {t('basic')}
    </div>
  );
}

export async function TypeTest() {
  const t = await getTranslations();

  // @ts-expect-error
  await getTranslations('Unknown');

  // @ts-expect-error
  t('AsyncComponent.unknown');
}
