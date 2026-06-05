import { getTranslations } from 'next-intl/server';
async function Page() {
    const t = await getTranslations('Account');
    t('name');
}
