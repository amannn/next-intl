import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t.rich("greeting", {
        b: (chunks)=><b>{chunks}</b>
    }, void 0, "Hello <b>Alice</b>!");
}
