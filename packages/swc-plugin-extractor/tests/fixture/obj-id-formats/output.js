import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t("greeting", {
        name: 'Alice'
    }, {
        date: {
            dateStyle: 'short'
        }
    }, "Hello!");
}
