export default function FeedLayout({children, modal}: LayoutProps<'/feed'>) {
  return (
    <section>
      <h1>Feed layout</h1>
      <div>{children}</div>
      <div>{modal}</div>
    </section>
  );
}
