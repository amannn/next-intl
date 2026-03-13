import { useTranslations as useTranslations$1 } from "next-intl";
import { getTranslations as getTranslations$1 } from "next-intl/server";
export async function generateMetadata() {
    const t = await getTranslations$1();
    return {
        title: t("tnuBMt", void 0, void 0, "Page title")
    };
}
export default function Page() {
    const t = useTranslations$1();
    return <div>{t("OpKKos", void 0, void 0, "Hello!")}</div>;
}
export async function getServerData() {
    const t = await getTranslations$1();
    return t("mOPTEA", void 0, void 0, "Server data message");
}
export function Component() {
    const t = useTranslations$1();
    return <span>{t("MgvtBu", void 0, void 0, "Component message")}</span>;
}
export async function anotherOne() {
    const translate = await getTranslations$1();
    return translate("sJK5Uk", void 0, void 0, "Another one 1");
}
export function AnotherOne() {
    const translate = useTranslations$1();
    return <span>{translate("2k7cS1", void 0, void 0, "Another one 2")}</span>;
}
export async function anotherTwo() {
    const translate = await getTranslations$1('another');
    return translate("6jb0KP", void 0, void 0, "Two 1");
}
export function AnotherTwo() {
    const translate = useTranslations$1('another');
    return <span>{translate("KVQtmd", void 0, void 0, "Two 2")}</span>;
}
