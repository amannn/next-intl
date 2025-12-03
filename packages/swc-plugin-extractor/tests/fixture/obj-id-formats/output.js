import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("greeting", {
        name: 'Alice'
    }, {
        date: {
            dateStyle: 'short'
        }
    }, "Hello!");
}
