import { useTranslations as useExtracted } from "next-intl";
import { getTranslations as getExtracted } from "next-intl/server";
export async function generateMetadata() {
    const t = await getExtracted();
    return {
        title: t("tnuBMt", void 0, void 0, "Page title")
    };
}
export default function Page() {
    const t = useExtracted();
    return <div>{t("OpKKos", void 0, void 0, "Hello!")}</div>;
}
export async function getServerData() {
    const t = await getExtracted();
    return t("mOPTEA", void 0, void 0, "Server data message");
}
export function Component() {
    const t = useExtracted();
    return <span>{t("MgvtBu", void 0, void 0, "Component message")}</span>;
}
export async function anotherOne() {
    const translate = await getExtracted();
    return translate("sJK5Uk", void 0, void 0, "Another one 1");
}
export function AnotherOne() {
    const translate = useExtracted();
    return <span>{translate("2k7cS1", void 0, void 0, "Another one 2")}</span>;
}
export async function anotherTwo() {
    const translate = await getExtracted('another');
    return translate("6jb0KP", void 0, void 0, "Two 1");
}
export function AnotherTwo() {
    const translate = useExtracted('another');
    return <span>{translate("KVQtmd", void 0, void 0, "Two 2")}</span>;
}
