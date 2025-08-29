export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
