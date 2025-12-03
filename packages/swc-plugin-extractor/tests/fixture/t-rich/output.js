import { useTranslations as useExtracted } from 'next-intl';
function Component() {
    const t = useExtracted();
    t.rich("C+nN8a", {
        b: (chunks)=><b>{chunks}</b>
    }, void 0, "Hello <b>Alice</b>!");
}
