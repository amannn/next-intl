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
  }
}
