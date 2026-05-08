import { useTranslations as useTranslations$1 } from "next-intl";
function Component() {
    const t = useTranslations$1();
    t("OpKKos", void 0, void 0, "Hello!");
    // Some other code
    console.log("test");
    t("OpKKos", void 0, void 0, "Hello!");
}
