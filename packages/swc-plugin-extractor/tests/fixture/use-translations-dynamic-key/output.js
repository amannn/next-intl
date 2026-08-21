import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations('Namespace');
    const g = useTranslations();
    const key = 'about';
    // Dynamic key under a namespace: only the namespace is statically known.
    t(key);
    // Dynamic key in the global namespace: nothing is statically analyzable.
    g(key);
}
