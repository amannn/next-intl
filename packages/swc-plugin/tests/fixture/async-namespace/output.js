import { getTranslations } from 'next-intl/server';
async function Component() {
    const t = await getTranslations('ui');
    t("OpKKos", void 0, void 0, "Hello!");
}
