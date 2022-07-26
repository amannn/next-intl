import { useEffect } from "react";
import { useTranslations } from 'next-intl'


export default function ClientWidget() {
  useEffect(() => {
    console.log('ClientWidget: useEffect')
  }, []);

  const t = useTranslations('ClientWidget');

  return <p>{t('title')}</p>

}