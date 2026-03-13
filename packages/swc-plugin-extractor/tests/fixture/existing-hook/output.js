import { useTranslations as useTranslations$1, useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    const t2 = useTranslations();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
