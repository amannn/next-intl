import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  title: string;
};

export default function DesignSection({children, title}: Props) {
  return (
    <section className="space-y-8">
      <h2 className="text-5xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
