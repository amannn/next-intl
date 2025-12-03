import { getTranslations as getExtracted } from 'next-intl/server';
async function Component() {
    const translate = await getExtracted();
    translate("0KGiQf", void 0, void 0, "Hello there!");
}
