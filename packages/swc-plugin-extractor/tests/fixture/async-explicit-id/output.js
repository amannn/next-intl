import { getTranslations } from 'next-intl/server';
async function Component() {
    const t = await getTranslations();
    t("greeting", {
        name: 'Alice'
    }, void 0, "Hello {name}!");
}
