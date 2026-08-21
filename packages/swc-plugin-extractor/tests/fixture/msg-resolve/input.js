import { msg, useExtracted } from "next-intl";

const pending = msg("Pending");
const greeting = msg("Hello {name}!");

const STATUS_LABELS = {
  pending,
  shipped: msg("Shipped"),
};

function Component({ status, name }) {
  const t = useExtracted();
  t(pending);
  t(greeting, { name });
  t(STATUS_LABELS[status]);
  t.has(pending);
  t.rich(pending);
  t.markup(pending);
}
