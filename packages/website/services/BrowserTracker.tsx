import * as vercel from '@vercel/analytics';

export default class BrowserTracker {
  public static trackEvent({data, name}: {data?: any; name: string}) {
    if (typeof window !== 'undefined') {
      const umami = (window as any).umami;
      if (umami) {
        return umami.trackEvent(name, data);
      } else {
        console.warn('umami not loaded');
      }
    }

    if (data && Object.keys(data).length > 2) {
      console.error('Vercel Analytics only supports 2 properties per event');
    }

    vercel.track(name, data);
  }
}
