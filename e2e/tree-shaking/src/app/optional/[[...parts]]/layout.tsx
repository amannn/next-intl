export default function OptionalLayout({
  children
}: LayoutProps<'/optional/[[...parts]]'>) {
  return <>{children}</>;
}
