import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
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
export function Component() {
    const t = useTranslations();
    return <span>{t("MgvtBu", void 0, void 0, "Component message")}</span>;
}
export async function anotherOne() {
    const translate = await getTranslations();
    return translate("sJK5Uk", void 0, void 0, "Another one 1");
}
export function AnotherOne() {
    const translate = useTranslations();
    return <span>{translate("2k7cS1", void 0, void 0, "Another one 2")}</span>;
}     
export async function anotherTwo() {
    const translate = await getTranslations('another');
    return translate("6jb0KP", void 0, void 0, "Two 1");
}
export function AnotherTwo() {
    const translate = useTranslations('another');
    return <span>{translate("KVQtmd", void 0, void 0, "Two 2")}</span>;
}