import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted('ui');
    t("OpKKos", void 0, void 0, "Hello!");
}
