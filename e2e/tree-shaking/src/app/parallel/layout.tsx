export default function ParallelLayout({
  activity,
  children,
  team
}: LayoutProps<'/parallel'>) {
  return (
    <section>
      <h1>Parallel layout</h1>
      <div>{children}</div>
      <div>{team}</div>
      <div>{activity}</div>
    </section>
  );
}
