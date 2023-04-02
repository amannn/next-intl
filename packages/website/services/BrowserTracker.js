export default class BrowserTracker {
  static trackEvent({data, name}) {
    if (typeof window !== 'undefined') {
      if (window.umami) {
        return window.umami.trackEvent(name, data);
      } else {
        console.warn('umami not loaded');
      }
    }
  }
}
