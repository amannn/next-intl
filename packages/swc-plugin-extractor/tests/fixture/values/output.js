import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t("tBFOH1", {
        name: 'Alice'
    }, void 0, "Hello, {name}!");
}
