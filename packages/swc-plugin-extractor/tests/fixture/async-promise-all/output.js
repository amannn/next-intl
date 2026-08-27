import { getTranslations as getTranslations$1, getTranslations } from 'next-intl/server';
import getData from './getData';
async function Component() {
    const [t, nav, data] = await Promise.all([
        getTranslations$1(),
        getTranslations('Navigation'),
        getData()
    ]);
    t("0KGiQf", void 0, void 0, "Hello there!");
    nav('title');
    return data;
}
