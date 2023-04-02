import BrowserTracker from 'services/BrowserTracker';

export default function PartnerLink({
  as: Component = 'a',
  href,
  name,
  ...rest
}) {
  function onClick() {
    BrowserTracker.trackEvent({
      name: 'partner-referral',
      data: {href, name}
    });
  }

  return <Component href={href} onClick={onClick} target="_blank" {...rest} />;
}
