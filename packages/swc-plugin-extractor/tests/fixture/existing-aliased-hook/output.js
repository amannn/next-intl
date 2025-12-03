import { useTranslations as useExtracted, useTranslations as useT } from 'next-intl';
function Component() {
    const t = useExtracted();
    const t2 = useT();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
