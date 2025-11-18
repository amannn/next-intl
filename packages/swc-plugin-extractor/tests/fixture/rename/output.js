import { useTranslations } from 'next-intl';
function Component() {
    const translate = useTranslations();
    translate("OpKKos", void 0, void 0, "Hello!");
}
