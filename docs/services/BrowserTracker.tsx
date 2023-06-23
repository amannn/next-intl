import * as vercel from '@vercel/analytics/react';

type Event = {
  name: 'partner-referral';
  data: {href: string; name: string};
};

export default class BrowserTracker {
  public static trackEvent({data, name}: Event) {
    const promises = [];

    if (typeof window !== 'undefined') {
      const umami = (window as any).umami;
      if (umami) {
        promises.push(umami.track(name, data));
      } else {
        console.warn('umami not loaded');
      }
    }

    promises.push(vercel.track(name, data));

    return Promise.all(promises);
  }
}
