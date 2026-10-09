import { useTranslations as useTranslations$1 } from 'next-intl';
export function Component() {
    const t = useTranslations$1();
    // Same message, different descriptions -> distinct hashes
    const header = t("RByuRZ", void 0, void 0, "Hello world");
    const footer = t("ZdC-As", void 0, void 0, "Hello world");
    // Same message, no description
    const defaultMsg = t("t_eDuu", void 0, void 0, "Hello world");
    return null;
}
