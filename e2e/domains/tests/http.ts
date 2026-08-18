import http from 'node:http';

/**
 * Domain-based routing is resolved from the `x-forwarded-host` header (with a
 * fallback to `host`). Requests are therefore sent to the local server while
 * the domain is announced via forwarding headers—just like a reverse proxy in
 * front of the app would do. This avoids the need for `/etc/hosts` entries as
 * well as for domains that are aware of the port of the local server.
 */
function fetchWithForwardedHost(
  port: number,
  forwardedHost: string,
  path: string
): Promise<{status: number; location?: string; body: string}> {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers: {
          'x-forwarded-host': forwardedHost,
          'x-forwarded-proto': 'http',
          // Avoids that the port of the local server ends up in redirects
          'x-forwarded-port': '80'
        }
      },
      (response) => {
        let body = '';
        response.setEncoding('utf-8');
        response.on('data', (chunk) => (body += chunk));
        response.on('end', () =>
          resolve({
            status: response.statusCode!,
            location: response.headers.location,
            body
          })
        );
      }
    );
    request.on('error', reject);
    request.end();
  });
}

export type Hop = {
  /** The requested URL. */
  url: string;
  status: number;
  /** The value of the `location` header, if the response is a redirect. */
  location?: string;
};

export type Result = {
  /** All requests that were necessary, incl. the final one. */
  hops: Array<Hop>;
  /** The URL that was resolved after following all redirects. */
  url: string;
  status: number;
  body: string;
};

export async function follow(
  port: number,
  startUrl: string,
  maxHops = 10
): Promise<Result> {
  const hops: Array<Hop> = [];
  let url = new URL(startUrl);

  for (let i = 0; i < maxHops; i++) {
    const response = await fetchWithForwardedHost(
      port,
      url.host,
      url.pathname + url.search
    );
    hops.push({
      url: url.toString(),
      status: response.status,
      location: response.location
    });

    if (response.location) {
      url = new URL(response.location, url);
    } else {
      return {
        hops,
        url: url.toString(),
        status: response.status,
        body: response.body
      };
    }
  }

  throw new Error(`Too many redirects:\n${JSON.stringify(hops, null, 2)}`);
}

export function getPort() {
  const port = Number(process.env.PW_E2E_DOMAINS_PORT);
  if (!Number.isInteger(port)) {
    throw new Error('Missing PW_E2E_DOMAINS_PORT');
  }
  return port;
}
