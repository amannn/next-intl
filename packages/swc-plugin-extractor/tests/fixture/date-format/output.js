import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t("5n+ZPU", {
        date: new Date()
    }, {
        short: {
            dateStyle: 'short'
        }
    }, "{date, date, short}!");
}
