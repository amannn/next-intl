import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t.rich("C+nN8a", {
        b: (chunks)=><b>{chunks}</b>
    }, void 0, "Hello <b>Alice</b>!");
}
