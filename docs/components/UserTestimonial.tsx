import Image from 'next/image';

type Props = {
  position: string;
  href: string;
  portraitUrl: string;
  quote: string;
  userName: string;
};

export default function UserTestimonial({
  position,
  href,
  portraitUrl,
  quote,
  userName
}: Props) {
  return (
    <a
      className="block rounded-sm bg-white p-6 dark:bg-slate-800"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-center">
        <Image
          alt={userName}
          className="rounded-full"
          height={48}
          src={portraitUrl}
          width={48}
        />
        <div className="ml-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {userName}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">{position}</p>
        </div>
      </div>
      <p className="mt-4 indent-[-0.4rem] text-slate-900 dark:text-white">
        “{quote}”
      </p>
    </a>
  );
}
