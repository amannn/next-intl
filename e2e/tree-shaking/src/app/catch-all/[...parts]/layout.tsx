export default function CatchAllLayout({
  children
}: LayoutProps<'/catch-all/[...parts]'>) {
  return <>{children}</>;
}
