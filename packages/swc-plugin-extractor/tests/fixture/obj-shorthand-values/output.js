import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    const values = {
        name: 'Alice'
    };
    t("wafoOY", values, void 0, "Hello {name}!");
}
