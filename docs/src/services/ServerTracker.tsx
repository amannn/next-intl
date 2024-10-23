import * as vercel from '@vercel/analytics/server';

export default class ServerTracker {
  public static async trackEvent({
    data,
    name
  }: {
    data?: Record<string, string>;
    name: string;
  }) {
    return vercel.track(name, data).catch((error) => {
      throw new Error('Vercel tracking failed', {cause: error});
    });
  }
}
