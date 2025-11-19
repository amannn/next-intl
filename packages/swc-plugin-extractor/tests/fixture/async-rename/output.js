import { getTranslations } from 'next-intl/server';
async function Component() {
    const translate = await getTranslations();
    translate("0KGiQf", void 0, void 0, "Hello there!");
}
