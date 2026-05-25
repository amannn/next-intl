import { getTranslations as getTranslations$1 } from 'next-intl/server';
async function Component() {
    const translate = await getTranslations$1();
    translate("0KGiQf", void 0, void 0, "Hello there!");
}
