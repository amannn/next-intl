import { getTranslations as getTranslations$1 } from 'next-intl/server';
async function Component() {
    const t = await getTranslations$1({
        locale: 'en'
    });
    t("0KGiQf", void 0, void 0, "Hello there!");
}
