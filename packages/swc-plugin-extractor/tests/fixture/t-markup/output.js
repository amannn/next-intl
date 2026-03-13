import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t.markup("C+nN8a", {
        b: (chunks)=>`<b>${chunks}</b>`
    }, void 0, "Hello <b>Alice</b>!");
}
