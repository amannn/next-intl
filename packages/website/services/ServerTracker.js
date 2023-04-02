export default class ServerTracker {
  static postToCollect({body, headers, req}) {
    const {referer} = req.headers;
    const refererUrl = referer ? new URL(referer) : undefined;

    const language = req.headers['accept-language']
      ?.split(',')
      .at(0)
      ?.replace(/;.*/, '');

    return fetch(process.env.UMAMI_URL + '/api/collect', {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
        Referer: referer
      },
      body: JSON.stringify({
        ...body,
        payload: {
          language,
          website: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
          hostname: refererUrl?.hostname,
          url: refererUrl?.pathname,
          ...body.payload
        }
      })
    }).then((res) =>
      res.text().then((nextAuth) => {
        if (!nextAuth || !res.ok) {
          throw new Error(
            'Failed to track event: ' + res.status + nextAuth + ' '
          );
        }
        return nextAuth;
      })
    );
  }

  static createAuth(req) {
    return ServerTracker.postToCollect({
      req,
      body: {
        type: 'pageview',
        payload: {url: req.url}
      }
    });
  }

  static async trackEvent({data, name, req}) {
    return ServerTracker.postToCollect({
      req,
      headers: {
        'x-umami-cache': await ServerTracker.createAuth(req)
      },
      body: {
        type: 'event',
        payload: {
          event_name: name,
          event_data: data
        }
      }
    });
  }
}
