import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    if (t.has("j0tI96")) {
        return t("j0tI96", void 0, void 0, "Hello here!");
    } else {
        return t("0KGiQf", void 0, void 0, "Hello there!");
    }
}
