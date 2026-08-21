import { useTranslations } from 'use-intl';
import { useTranslations as useReactTranslations } from 'use-intl/react';
function Component() {
    const t = useTranslations('Namespace');
    const u = useReactTranslations();
    t('title');
    u('global');
}
