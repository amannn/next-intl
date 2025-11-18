import { getTranslations } from 'next-intl/server';
async function Component() {
    const t = await getTranslations({
        locale: 'en'
    });
    t("0KGiQf", void 0, void 0, "Hello there!");
}
