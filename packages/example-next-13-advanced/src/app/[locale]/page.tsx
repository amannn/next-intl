import {useTranslations} from 'next-intl';
import CurrentTime from '../../components/CurrentTime';
import LocaleSwitcher from '../../components/LocaleSwitcher';
import PageLayout from '../../components/PageLayout';
import MessagesAsPropsCounter from '../../components/client/01-MessagesAsPropsCounter';
import MessagesOnClientCounter from '../../components/client/02-MessagesOnClientCounter';

export default function Index() {
  const t = useTranslations('Index');

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <p data-testid="RichText">
        {t.rich('rich', {important: (chunks) => <b>{chunks}</b>})}
      </p>
      <p
        dangerouslySetInnerHTML={{__html: t.raw('rich')}}
        data-testid="RawText"
      />
      <p data-testid="GlobalDefaults">{t.rich('globalDefaults')}</p>
      <CurrentTime />
      <LocaleSwitcher />
      <MessagesAsPropsCounter />
      {/* @ts-expect-error Server Component */}
      <MessagesOnClientCounter />
    </PageLayout>
  );
}
