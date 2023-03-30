import {useMDXComponents} from 'nextra/mdx';
import PartnerLink from './PartnerLink';

export default function PartnerContentLink(props) {
  const components = useMDXComponents();
  return <PartnerLink as={components.a} {...props} />;
}
