import { useTranslations as useTranslations$1, useTranslations } from 'next-intl';
function Component() {
    const e = useTranslations$1();
    const t = useTranslations('Namespace');
    e("OpKKos", void 0, void 0, "Hello!");
    t('title');
}
