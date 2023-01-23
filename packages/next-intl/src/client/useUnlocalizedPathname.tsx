import {usePathname} from 'next/navigation';

export function unlocalizePathname(pathname: string | null) {
  return pathname == null
    ? pathname
    : pathname.replace(/^\/[\w_-]+/, '') || '/';
}

export default function useUnlocalizedPathname() {
  return unlocalizePathname(usePathname());
}
