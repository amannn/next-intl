import {useLocale, useTranslations} from 'next-intl';
import NamedLink from '../../components/NamedLink';
import {getAllGuitars} from '../../db';

export default function Index() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const guitars = getAllGuitars(locale);

  return (
    <div>
      <h1>{t('title')}</h1>
      <ul>
        {guitars.map((guitar) => (
          <li key={guitar.id}>
            <NamedLink name="detail" params={{slug: guitar.slug}}>
              {guitar.name}
            </NamedLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
