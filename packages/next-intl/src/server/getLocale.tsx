import {getRequestLocale} from './RequestLocale';

export default function getLocale() {
  return Promise.resolve(getRequestLocale());
}
