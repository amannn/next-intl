import { useTranslations as useExtracted, useTranslations } from 'next-intl';
function Component() {
    const t = useExtracted();
    const t2 = useTranslations();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
