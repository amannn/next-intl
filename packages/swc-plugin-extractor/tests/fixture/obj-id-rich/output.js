import { useTranslations as useTranslations$1 } from 'next-intl';
function Component() {
    const t = useTranslations$1();
    t.rich("greeting", {
        b: (chunks)=><b>{chunks}</b>
    }, void 0, "Hello <b>Alice</b>!");
}
