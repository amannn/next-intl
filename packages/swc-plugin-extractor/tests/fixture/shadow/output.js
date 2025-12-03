import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t("+YJVTi", void 0, void 0, "Hey!");
}
const t = (msg)=>msg;
t("Should not be transformed");
