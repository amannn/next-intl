import { msg, useTranslations as useTranslations$1 } from "next-intl";
const pending = "eKEL_g";
const greeting = "wafoOY";
const STATUS_LABELS = {
    pending,
    shipped: "OtIOMb"
};
function Component({ status, name }) {
    const t = useTranslations$1();
    t(pending);
    t(greeting, {
        name
    });
    t(STATUS_LABELS[status]);
    t.has(pending);
    t.rich(pending);
    t.markup(pending);
}
