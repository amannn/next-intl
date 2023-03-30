export default function PartnerLink({as: Component = 'a', href, ...rest}) {
  return <Component href={href} target="_blank" {...rest} />;
}
