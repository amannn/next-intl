import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/dist/client/router';
import {useState} from 'react';
import Code from 'components/Code';
import Navigation from 'components/Navigation';

export default function Test() {
  const {locale} = useRouter();
  const [now] = useState(() => new Date());
  const t = useTranslations('Test');

  return (
    <div>
      <Navigation />
      <h1>{t('title')}</h1>
      <p>
        {t('description', {
          locale,
          code: (children) => <Code>{children}</Code>
        })}
      </p>
      <p>{t('now', {now})}</p>
      <p>{t('preciseNumber', {value: 10.92817381})}</p>
    </div>
  );
}

export function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: locale
        ? require(`../../messages/test/${locale}.json`)
        : undefined
    }
  };
}
