import Storage from '../../next-intl/IntlStorage';

export function generateStaticParams() {
  return ['de', 'en'].map((locale) => ({locale}));
}

export default function Index() {
  const value = Storage.get();

  return (
    <p>
      Hello {value.locale} ({value.now})
    </p>
  );
}

// import {useTranslations} from 'next-intl';
// import LocaleSwitcher from 'components/LocaleSwitcher';
// import PageLayout from 'components/PageLayout';

// import {useContext} from 'react';
// import ServerOnlyContext from './ServerOnlyContext';

// export default function Index() {
//   // TODO: Use middleware to redirect to a specific locale

//   const serverOnly = useContext(ServerOnlyContext);
//   // const t = useTranslations('Index');

//   console.log('Index');

//   // return <p>{t('title')}</p>;

//   return <p>Hello {serverOnly.only.for.server + 10}</p>;

//   // return (
//   //   <PageLayout title={t('title')}>
//   //     <p>{t('description')}</p>
//   //     <LocaleSwitcher />
//   //   </PageLayout>
//   // );
// }
