import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("5n+ZPU", {
        date: new Date()
    }, {
        short: {
            dateStyle: 'short'
        }
    }, "{date, date, short}!");
}
