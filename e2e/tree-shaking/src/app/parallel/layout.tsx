import {ReactNode} from 'react';

type Props = {
  activity: ReactNode;
  children: ReactNode;
  team: ReactNode;
};

export default function ParallelLayout({activity, children, team}: Props) {
  return (
    <section>
      <h1>Parallel layout</h1>
      <div>{children}</div>
      <div>{team}</div>
      <div>{activity}</div>
    </section>
  );
}
