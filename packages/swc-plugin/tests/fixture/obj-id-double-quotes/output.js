import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("greeting", void 0, void 0, "Hello!");
}
