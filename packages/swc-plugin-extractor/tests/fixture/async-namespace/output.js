import { getTranslations as getExtracted } from 'next-intl/server';
async function Component() {
    const t = await getExtracted('ui');
    t("OpKKos", void 0, void 0, "Hello!");
}
