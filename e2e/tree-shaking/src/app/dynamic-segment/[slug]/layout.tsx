export default function DynamicSegmentLayout({
  children
}: LayoutProps<'/dynamic-segment/[slug]'>) {
  return <>{children}</>;
}
