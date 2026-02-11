import {NextIntlClientProvider} from 'next-intl';

export default function ParallelLayout({
  activity,
  children,
  team
}: LayoutProps<'/parallel'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/parallel">
      <section>
        <h1>Parallel layout</h1>
        <div>{children}</div>
        <div>{team}</div>
        <div>{activity}</div>
      </section>
    </NextIntlClientProvider>
  );
}
