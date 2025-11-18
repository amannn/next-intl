import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("greeting", {
        name: 'Alice'
    }, {
        date: {
            dateStyle: 'short'
        }
    }, "Hello!");
}
