import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("5n+ZPU", {
        date: new Date()
    }, {
        short: {
            dateStyle: 'short'
        }
    }, "{date, date, short}!");
}
