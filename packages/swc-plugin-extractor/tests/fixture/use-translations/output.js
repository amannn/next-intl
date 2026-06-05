import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations('Namespace');
    const g = useTranslations();
    t('title');
    t.rich('rich');
    t.markup('markup');
    t.has('has');
    t.raw('raw');
    g('global');
}
