import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("greeting", {
        name: 'Alice'
    }, void 0, "Hello!");
}
