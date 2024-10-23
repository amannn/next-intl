import {HTMLAttributes} from 'react';
import BrowserTracker from 'services/BrowserTracker';

type Props = HTMLAttributes<HTMLAnchorElement> & {
  as?: React.ElementType;
  href: string;
  name: string;
};

export default function PartnerLink({
  as: Component = 'a',
  href,
  name,
  ...rest
}: Props) {
  function onClick() {
    BrowserTracker.trackEvent({
      name: 'partner-referral',
      data: {href, name}
    });
  }

  return <Component href={href} onClick={onClick} target="_blank" {...rest} />;
}
