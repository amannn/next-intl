import { msg, useExtracted } from "next-intl";

function Component() {
  const t = useExtracted();
  t(msg("Hello"));
}
