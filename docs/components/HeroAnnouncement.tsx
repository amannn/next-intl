import Link from 'next/link';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  href: string;
};

export default function HeroAnnouncement({children, href}: Props) {
  return (
    <Link
      className="mt-10 inline-flex border border-green-300/50 px-4 py-2 font-semibold text-green-300 transition-colors hover:border-white/50 hover:text-white lg:mt-20"
      href={href}
    >
      <span className="mr-3 inline-block">📣</span> <span>{children}</span>
    </Link>
  );
}
