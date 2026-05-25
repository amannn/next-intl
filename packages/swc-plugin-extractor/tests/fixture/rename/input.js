import {useExtracted} from 'next-intl';

function Component() {
  const translate = useExtracted();
  translate("Hello!");
}
