import { useTranslations as useTranslations$1, useTranslations as useT } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    const t2 = useT();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
