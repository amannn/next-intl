import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations('ui');
    t("greeting", void 0, void 0, "Hello!");
}
