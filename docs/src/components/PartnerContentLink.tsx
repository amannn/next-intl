import {useMDXComponents} from 'nextra/mdx';
import {ComponentProps, ElementType} from 'react';
import PartnerLink from './PartnerLink';

type Props = Omit<ComponentProps<typeof PartnerLink>, 'as'>;

export default function PartnerContentLink(props: Props) {
  const components = useMDXComponents();
  return <PartnerLink as={components.a as ElementType} {...props} />;
}
