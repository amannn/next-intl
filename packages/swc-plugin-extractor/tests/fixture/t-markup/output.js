import { useTranslations } from 'next-intl';
function Component() {
    const t = useTranslations();
    t.markup("C+nN8a", {
        b: (chunks)=>`<b>${chunks}</b>`
    }, void 0, "Hello <b>Alice</b>!");
}
