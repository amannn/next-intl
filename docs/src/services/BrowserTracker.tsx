import * as vercel from '@vercel/analytics/react';

type Event = {
  name: 'partner-referral';
  data: {href: string; name: string};
};

export default class BrowserTracker {
  public static trackEvent({data, name}: Event) {
    return vercel.track(name, data);
  }
}
