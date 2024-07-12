import {cache} from 'react';
import {_createFormatters} from 'use-intl';

function getFormattersImpl(): ReturnType<typeof _createFormatters> {
  return _createFormatters();
}
const getFormatters = cache(getFormattersImpl);
export default getFormatters;
