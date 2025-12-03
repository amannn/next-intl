import { getTranslations as getExtracted } from 'next-intl/server';
async function Component() {
    const t = await getExtracted();
    t("greeting", {
        name: 'Alice'
    }, void 0, "Hello {name}!");
}
