import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted('ui');
    t("greeting", void 0, void 0, "Hello!");
}
