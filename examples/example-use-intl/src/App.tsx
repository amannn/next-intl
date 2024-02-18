import {useTranslations} from 'use-intl';

type Props = {
  user: {
    name: string;
  };
};

export default function App({user}: Props) {
  const t = useTranslations('App');
  return <h1>{t('hello', {username: user.name})}</h1>;
}
