import { msg } from "next-intl";

const save = msg({
  message: "Save",
  description: "Form submit button",
});

const explicit = msg({
  id: "status.pending",
  message: "Pending",
});

const namespaced = msg({
  message: "Required",
  namespace: "validation",
});
