import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("tBFOH1", {
        name: 'Alice'
    }, void 0, "Hello, {name}!");
}
