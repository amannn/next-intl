import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t("+YJVTi", void 0, void 0, "Hey!");
}
const t = (msg)=>msg;
t("Should not be transformed");
