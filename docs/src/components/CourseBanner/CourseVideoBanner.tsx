import {PlayCircleIcon} from '@heroicons/react/24/outline';

type Props = {
  className?: string;
  href: string;
  title: string;
};

export default function CourseVideoBanner({className, href, title}: Props) {
  return (
    <div className={className}>
      <a
        className="inline-flex items-center gap-2 rounded-lg bg-primary-700/5 py-2 pl-3 pr-4 transition-colors hover:bg-slate-200 dark:bg-primary-300/10 dark:hover:bg-primary-300/20"
        href={href}
      >
        <PlayCircleIcon className="size-6 text-primary-600" />
        <span className="font-semibold">{title}</span>
      </a>
    </div>
  );
}
