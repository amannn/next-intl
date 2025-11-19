import { useTranslations, useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    const t2 = useTranslations();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
