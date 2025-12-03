import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("tBFOH1", {
        name: 'Alice'
    }, void 0, "Hello, {name}!");
}
