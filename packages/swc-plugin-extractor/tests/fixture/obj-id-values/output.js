import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("greeting", {
        name: 'Alice'
    }, void 0, "Hello!");
}
