import {getTranslations} from 'next-intl/server';

export default async function AsyncComponentWithoutNamespaceAndLocale() {
  const t = await getTranslations();

  return (
    <div data-testid="AsyncComponentWithoutNamespaceAndLocale">
      {t('AsyncComponent.basic')}
    </div>
  );
}

export async function TypeTest() {
  const t = await getTranslations();

  // @ts-expect-error
  t('AsyncComponent.unknown');
}
