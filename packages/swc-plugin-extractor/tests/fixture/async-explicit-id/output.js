import { getTranslations as getTranslations$1 } from 'next-intl/server';
async function Component() {
    const t = await getTranslations$1();
    t("greeting", {
        name: 'Alice'
    }, void 0, "Hello {name}!");
}
