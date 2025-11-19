import {useExtracted} from 'next-intl';

function Component() {
  let t = useExtracted();
  t("Hey!");
}
