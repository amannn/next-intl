import { getTranslations as getExtracted } from 'next-intl/server';
async function Component() {
    const t = await getExtracted({
        locale: 'en'
    });
    t("0KGiQf", void 0, void 0, "Hello there!");
}
