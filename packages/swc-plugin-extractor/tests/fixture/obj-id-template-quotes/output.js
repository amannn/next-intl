import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("greeting", void 0, void 0, "Hello!");
}
