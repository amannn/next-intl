import * as vercel from '@vercel/analytics/server';

export default class ServerTracker {
  private static postToCollect({
    auth,
    body,
    request
  }: {
    body: {
      type: 'pageview' | 'event';
      payload?: any;
    };
    auth?: string;
    request: Request;
  }) {
    const referer = request.headers.get('referer');
    const requestUrl = new URL(request.url);

    const language = request.headers
      .get('accept-language')
      ?.split(',')
      .at(0)
      ?.replace(/;.*/, '');

    const headers = new Headers();
    headers.set('content-type', 'application/json');
    if (referer) {
      headers.set('referer', referer);
    }
    if (auth) {
      headers.set('x-umami-auth', auth);
    }

    return fetch(process.env.UMAMI_URL + '/api/collect', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...body,
        payload: {
          language,
          website: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
          hostname: requestUrl.hostname,
          url: requestUrl.pathname,
          ...body.payload
        }
      })
    }).then((res) =>
      res.text().then((nextAuth) => {
        if (!nextAuth || !res.ok) {
          throw new Error(
            'Failed to track umami event: ' + res.status + nextAuth + ' '
          );
        }
        return nextAuth;
      })
    );
  }

  private static createAuth(request: Request) {
    return ServerTracker.postToCollect({
      request,
      body: {
        type: 'pageview',
        payload: {url: request.url}
      }
    });
  }

  public static async trackEvent({
    data,
    name,
    request
  }: {
    data?: Record<string, string>;
    name: string;
    request: Request;
  }) {
    const promises = [];

    promises.push(
      vercel.track(name, data).catch((error) => {
        throw new Error('Vercel tracking failed', {cause: error});
      })
    );

    promises.push(
      ServerTracker.postToCollect({
        request,
        auth: await ServerTracker.createAuth(request),
        body: {
          type: 'event',
          payload: {
            event_name: name,
            event_data: data
          }
        }
      }).catch((error) => {
        throw new Error('Umami tracking failed', {cause: error});
      })
    );

    return Promise.all(promises);
  }
}
