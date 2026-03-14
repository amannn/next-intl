export default function CatalogGroupLayout({children}: LayoutProps<'/'>) {
  return (
    <section>
      <h1>Groups two pages with same provider</h1>
      {children}
    </section>
  );
}
