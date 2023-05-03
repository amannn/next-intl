import {ReactNode} from 'react';
import Wrapper from './Wrapper';

type Props = {
  children: ReactNode;
  description: string;
  title: string;
};

export default function Section({children, description, title}: Props) {
  return (
    <>
      <div className="mx-auto h-px w-full bg-gradient-to-r from-sky-300/0 via-sky-300/60 to-sky-300/0 dark:via-sky-300/30" />
      <section className="py-20 lg:py-40">
        <Wrapper>
          <div className="lg:text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
              {title}
            </h2>
            <div className="mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-400 lg:mx-auto lg:text-lg">
              {description}
            </div>
          </div>
          <div className="mt-10 lg:mt-24">{children}</div>
        </Wrapper>
      </section>
    </>
  );
}
