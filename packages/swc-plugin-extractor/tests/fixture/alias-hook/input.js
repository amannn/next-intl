import {useExtracted as useInlined} from 'next-intl';

function Component() {
  const t = useInlined();
  t("Hey!");
}
