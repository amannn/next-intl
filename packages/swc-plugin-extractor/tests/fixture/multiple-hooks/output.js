import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
export async function generateMetadata() {
    const t = await getTranslations();
    return {
        title: t("tnuBMt", void 0, void 0, "Page title")
    };
}
export default function Page() {
    const t = useTranslations();
    return <div>{t("OpKKos", void 0, void 0, "Hello!")}</div>;
}
export async function getServerData() {
    const t = await getTranslations();
    return t("mOPTEA", void 0, void 0, "Server data message");
}
export function ClientComponent() {
    const t = useTranslations();
    return <span>{t("IM08ur", void 0, void 0, "Client message")}</span>;
}
