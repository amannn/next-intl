import {
  createTranslator,
  useLocale,
  useMessages,
  useTranslations
} from 'next-intl';
import {getTranslations} from 'next-intl/server';

export function RegularComponent() {
  const t = useTranslations('ClientCounter');
  t('count', {count: 1});

  // @ts-expect-error
  t('count');
  // @ts-expect-error
  t('count', {num: 1});
}

export function CreateTranslator() {
  const messages = useMessages();
  const locale = useLocale();
  const t = createTranslator({
    locale,
    messages,
    namespace: 'ClientCounter'
  });

  t('count', {count: 1});

  // @ts-expect-error
  t('count');
  // @ts-expect-error
  t('count', {num: 1});
}

export async function AsyncComponent() {
  const t = await getTranslations('ClientCounter');
  t('count', {count: 1});

  // @ts-expect-error
  t('count');
  // @ts-expect-error
  t('count', {num: 1});
}
