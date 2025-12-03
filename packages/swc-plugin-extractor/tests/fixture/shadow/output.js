import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t("+YJVTi", void 0, void 0, "Hey!");
}
const t = (msg)=>msg;
t("Should not be transformed");
