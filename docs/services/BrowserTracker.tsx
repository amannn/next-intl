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

    return Promise.all(promises);
  }
}
