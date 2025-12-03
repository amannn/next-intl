import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const translate = useExtracted();
    translate("OpKKos", void 0, void 0, "Hello!");
}
