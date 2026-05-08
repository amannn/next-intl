import { useExtracted } from "next-intl";

function Component() {
  const t = useExtracted();
  t("Hello!");

  // Some other code
  console.log("test");

  t("Hello!");
}
