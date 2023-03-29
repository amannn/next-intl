import {useMDXComponents} from 'nextra/mdx';

export default function PartnerLink({children, href}) {
  const components = useMDXComponents();

  return (
    <components.a href={href} rel="noreferrer" target="_blank">
      {children}
    </components.a>
  );
}
