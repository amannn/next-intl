import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    const values = {
        date: new Date()
    };
    const formats = {
        date: {
            dateStyle: 'short'
        }
    };
    t("aaDPz2", values, formats, "Today is {date, date, short}");
}
