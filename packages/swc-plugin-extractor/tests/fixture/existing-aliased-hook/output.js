import { useTranslations as useT } from 'next-intl';
function Component() {
    const t = useT();
    const t2 = useT();
    t("piskIR", void 0, void 0, "Hello from extracted!");
    t2("greeting");
}
