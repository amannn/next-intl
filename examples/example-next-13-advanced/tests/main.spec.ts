import {test as it, expect, Page, BrowserContext} from '@playwright/test';

async function assertLocaleCookieValue(page: Page, value: string) {
  await expect(async () => {
    const cookie = (await page.context().cookies()).find(
      (cur) => cur.name === 'NEXT_LOCALE'
    );
    expect(cookie).toMatchObject({
      name: 'NEXT_LOCALE',
      value
    });
  }).toPass();
}

function getPageLoadTracker(context: BrowserContext) {
  const state = {numPageLoads: 0};

  context.on('request', (request) => {
    // Is the same in dev and prod
    if (request.url().includes('/chunks/main-app')) {
      state.numPageLoads++;
    }
  });

  return state;
}

it('handles unknown locales', async ({page}) => {
  const response = await page.goto('/unknown');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL('/unknown');
  await expect(
    page.getByRole('heading', {name: 'This page was not found (404)'})
  ).toBeVisible();
});

it('redirects to a matched locale at the root for non-default locales', async ({
  browser
}) => {
  const context = await browser.newContext({locale: 'de'});
  const page = await context.newPage();

  await page.goto('/');
  await expect(page).toHaveURL('/de');
  page.getByRole('heading', {name: 'Start'});
});

it('redirects a prefixed pathname for the default locale to the unprefixed version', async ({
  request
}) => {
  const response = await request.get('/en', {
    maxRedirects: 0
  });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toEqual('/');
});

it('redirects a more specific locale to a more generic one', async ({
  browser
}) => {
  const context = await browser.newContext({locale: 'de-DE'});
  const page = await context.newPage();

  await page.goto('/');
  await expect(page).toHaveURL('/de');
  page.getByRole('heading', {name: 'Start'});
});

it('does not redirect on the root if the default locale is matched', async ({
  page
}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  page.getByRole('heading', {name: 'Home'});
});

it('supports unprefixed routing for the default locale', async ({page}) => {
  await page.goto('/de/verschachtelt');
  await expect(page).toHaveURL('/de/verschachtelt');
  page.getByRole('heading', {name: 'Verschachtelt'});
});

it('supports prefixed routing for non-default locales', async ({page}) => {
  await page.goto('/nested');
  await expect(page).toHaveURL('/nested');
  page.getByRole('heading', {name: 'Nested'});
});

it('redirects unprefixed paths for non-default locales', async ({browser}) => {
  const context = await browser.newContext({locale: 'de'});
  const page = await context.newPage();

  await page.goto('/nested');
  await expect(page).toHaveURL('/de/nested');
  page.getByRole('heading', {name: 'Verschachtelt'});
});

it('remembers the last locale', async ({page}) => {
  await page.goto('/de');

  // Wait for the cookie to be set on the client side
  await assertLocaleCookieValue(page, 'de');

  await page.goto('/');
  await expect(page).toHaveURL('/de');
});

it('sets the `lang` attribute on `html`', async ({page}) => {
  await page.goto('/en');
  await page.waitForSelector('html[lang="en"]');
});

it('can be used in the head', async ({page}) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('next-intl example');

  await page.goto('/de');
  await expect(page).toHaveTitle('next-intl Beispiel');
});

it('can be used to localize the page', async ({page}) => {
  await page.goto('/en');
  page.locator('text=This is the home page.');

  await page.goto('/de');
  page.locator('text=Das ist die Startseite.');
});

it('can pass internationalized labels to a client component', async ({
  page
}) => {
  await page.goto('/en');
  const element = page.getByTestId('MessagesAsPropsCount');
  await expect(element).toHaveText(/Current count: 0/);
  await element.getByRole('button', {name: 'Increment'}).click();
  await expect(element).toHaveText(/Current count: 1/);
});

it('can use next-intl on the client side', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('MessagesOnClientCounter');
  await expect(element).toHaveText(/Current count: 0/);
  await element.getByRole('button', {name: 'Increment'}).click();
  await expect(element).toHaveText(/Current count: 1/);
});

it('can use rich text', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('RichText');
  expect(await element.innerHTML()).toBe('This is a <b>rich</b> text.');
});

it('can use raw text', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('RawText');
  expect(await element.innerHTML()).toBe(
    'This is a <important>rich</important> text.'
  );
});

it('can use global defaults', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('GlobalDefaults');
  expect(await element.innerHTML()).toBe('<strong>Global string</strong>');
});

it('can use `getMessageFallback`', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('MissingMessage');
  expect(await element.innerHTML()).toBe(
    '`getMessageFallback` called for Index.missing'
  );
});

it('can use the core library', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('CoreLibrary');
  await expect(element).toHaveText('Relative time: tomorrow');
});

it('can use `Link` on the server', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('link', {name: /^Home$/})).toHaveAttribute(
    'href',
    '/'
  );
  await expect(page.getByRole('link', {name: 'Nested page'})).toHaveAttribute(
    'href',
    '/nested'
  );
});

it('can use `Link` with an object as `href`', async ({page}) => {
  await page.goto('/');
  const link = page.getByRole('link', {name: 'Go to home with query param'});
  await expect(link).toHaveAttribute('href', '/?test=true');
  await link.click();
  await expect(page).toHaveURL('/?test=true');
});

it('can use `Link` to link to the root of another language', async ({page}) => {
  await page.goto('/');
  const link = page.getByRole('link', {name: 'Switch to German'});
  await expect(link).toHaveAttribute('href', '/de');
  await link.click();
  await expect(page).toHaveURL('/de');
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();
  await expect(page).toHaveURL('/');
});

it('uses client-side transitions when using link', async ({context, page}) => {
  const tracker = getPageLoadTracker(context);

  await page.goto('/');
  expect(tracker.numPageLoads).toBe(1);

  await page.getByRole('link', {name: 'Nested page'}).click();
  await expect(page).toHaveURL('/nested');
  expect(tracker.numPageLoads).toBe(1);

  await page.getByRole('link', {name: 'Client page'}).click();
  await expect(page).toHaveURL('/client');
  expect(tracker.numPageLoads).toBe(1);

  await page.goBack();
  await expect(page).toHaveURL('/nested');
  expect(tracker.numPageLoads).toBe(1);

  await page.goForward();
  await expect(page).toHaveURL('/client');
  expect(tracker.numPageLoads).toBe(1);
});

it('keeps the locale cookie updated when changing the locale and uses soft navigation when changing the locale', async ({
  context,
  page
}) => {
  const tracker = getPageLoadTracker(context);

  await page.goto('/');
  await assertLocaleCookieValue(page, 'en');
  expect(tracker.numPageLoads).toBe(1);

  const link = page.getByRole('link', {name: 'Switch to German'});
  await link.hover();
  await assertLocaleCookieValue(page, 'en');
  await link.click();

  await expect(page).toHaveURL('/de');
  await assertLocaleCookieValue(page, 'de');

  // Somehow Next.js performs a hard refresh when
  // a non-preloaded route is being navigated to.
  expect(tracker.numPageLoads).toBe(2);
});

it('can use `Link` in client components without using a provider', async ({
  page
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('link', {name: 'Link on client without provider'})
  ).toHaveAttribute('href', '/');

  await page.goto('/de');
  await expect(
    page.getByRole('link', {name: 'Link on client without provider'})
  ).toHaveAttribute('href', '/de');
});

it('can use `Link` on the client', async ({page}) => {
  await page.goto('/client');
  await expect(page.getByRole('link', {name: 'Go to home'})).toHaveAttribute(
    'href',
    '/'
  );

  await page.goto('/de/client');
  await expect(page.getByRole('link', {name: 'Go to home'})).toHaveAttribute(
    'href',
    '/de'
  );
});

it('prefixes as necessary with `Link`', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('link', {name: /^Home$/})).toHaveAttribute(
    'href',
    '/'
  );
  await expect(page.getByRole('link', {name: 'Client page'})).toHaveAttribute(
    'href',
    '/client'
  );
  await expect(
    page.getByRole('link', {name: 'Switch to German'})
  ).toHaveAttribute('href', '/de');

  await page.goto('/en');
  await expect(page.getByRole('link', {name: /^Home$/})).toHaveAttribute(
    'href',
    '/'
  );
  await expect(page.getByRole('link', {name: 'Client page'})).toHaveAttribute(
    'href',
    '/client'
  );
  await expect(
    page.getByRole('link', {name: 'Switch to German'})
  ).toHaveAttribute('href', '/de');

  await page.goto('/de');
  await expect(page.getByRole('link', {name: /^Start$/})).toHaveAttribute(
    'href',
    '/de'
  );
  await expect(page.getByRole('link', {name: 'Client-Seite'})).toHaveAttribute(
    'href',
    '/de/client'
  );
  await expect(
    page.getByRole('link', {name: 'Zu Englisch wechseln'})
  ).toHaveAttribute('href', '/en');
});

it('supports a consistent `now` value across the server and client', async ({
  page
}) => {
  await page.goto('/en/client');

  const serverDate = await page.getByTestId('NowFromServer').textContent();
  const serverDateDelayed = await page
    .getByTestId('NowFromServerDelayed')
    .textContent();
  const clientDate = await page.getByTestId('NowFromClient').textContent();

  expect(serverDate).toBe(serverDateDelayed);
  expect(serverDate).toBe(clientDate);
});

it('can use `usePathname`', async ({page}) => {
  await page.goto('/client');
  await expect(page.getByTestId('UnlocalizedPathname')).toHaveText('/client');

  await page.goto('/en/client');
  await expect(page.getByTestId('UnlocalizedPathname')).toHaveText('/client');

  await page.goto('/de/client');
  await expect(page.getByTestId('UnlocalizedPathname')).toHaveText('/client');
});

it('returns the correct value from `usePathname` in the initial render', async ({
  request
}) => {
  expect(await (await request.get('/client')).text()).toContain(
    '<p data-testid="UnlocalizedPathname">/client</p>'
  );
  expect(await (await request.get('/de/client')).text()).toContain(
    '<p data-testid="UnlocalizedPathname">/client</p>'
  );
});

it('can use `redirect`', async ({page}) => {
  await page.goto('/redirect');
  await expect(page).toHaveURL('/client');

  await page.goto('/redirect');
  await expect(page).toHaveURL('/client');

  await page.goto('/de/redirect');
  await expect(page).toHaveURL('/de/client');
});

it('can navigate between sibling pages that share a parent layout', async ({
  page
}) => {
  await page.goto('/nested');
  await page.getByRole('link', {name: 'Client page'}).click();
  await expect(page).toHaveURL('/client');
  await page.getByRole('link', {name: 'Nested page'}).click();
  await expect(page).toHaveURL('/nested');
});

it('prefixes routes as necessary with the router', async ({page}) => {
  await page.goto('/');
  page.getByTestId('ClientRouterWithoutProvider-link').click();
  await expect(page).toHaveURL('/nested');

  await page.goto('/en');
  page.getByTestId('ClientRouterWithoutProvider-link').click();
  await expect(page).toHaveURL('/nested');

  await page.goto('/de');
  page.getByTestId('ClientRouterWithoutProvider-link').click();
  await expect(page).toHaveURL('/de/nested');
});

it('can set `now` and `timeZone` at runtime', async ({page}) => {
  page.setExtraHTTPHeaders({
    'x-now': '2020-01-01T00:00:00.000Z',
    'x-time-zone': 'Asia/Shanghai'
  });

  await page.goto('/en');
  const element = page.getByTestId('CurrentTime');
  await expect(element).toHaveText('Jan 1, 2020, 08:00 (Asia/Shanghai)');
});

it('keeps search params for directly matched pages', async ({page}) => {
  await page.goto('/de?param=true');
  await expect(page).toHaveURL('/de?param=true');
  await expect(page.getByTestId('SearchParams')).toHaveText(
    '{ "param": "true" }'
  );
});

it('keeps search params for rewrites', async ({page}) => {
  await page.goto('/?param=true');
  await expect(page).toHaveURL('/?param=true');
  await expect(page.getByTestId('SearchParams')).toHaveText(
    '{ "param": "true" }'
  );
});

it('keeps search params for redirects', async ({browser}) => {
  const context = await browser.newContext({locale: 'de-DE'});
  const page = await context.newPage();

  await page.goto('/?param=true');
  await expect(page).toHaveURL('/de?param=true');
  await expect(page.getByTestId('SearchParams')).toHaveText(
    '{ "param": "true" }'
  );
});

it('sets alternate links', async ({request}) => {
  async function getLinks(pathname: string) {
    return (
      (await request.get(pathname))
        .headers()
        .link.split(', ')
        // On CI, Playwright uses a different host somehow
        .map((cur) => cur.replace(/0\.0\.0\.0/g, 'localhost'))
        // Normalize ports
        .map((cur) => cur.replace(/localhost:\d{4}/g, 'localhost:3000'))
    );
  }

  for (const pathname of ['/', '/en', '/de']) {
    expect(await getLinks(pathname)).toEqual([
      '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
      '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
      '<http://localhost:3000/es>; rel="alternate"; hreflang="es"',
      '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
    ]);
  }

  for (const pathname of ['/nested', '/en/nested', '/de/nested']) {
    expect(await getLinks(pathname)).toEqual([
      '<http://localhost:3000/nested>; rel="alternate"; hreflang="en"',
      '<http://localhost:3000/de/nested>; rel="alternate"; hreflang="de"',
      '<http://localhost:3000/es/nested>; rel="alternate"; hreflang="es"',
      '<http://localhost:3000/nested>; rel="alternate"; hreflang="x-default"'
    ]);
  }
});

it('can use rewrites to localize pathnames', async ({page, request}) => {
  await page.goto('/de/verschachtelt');
  page.getByRole('heading', {name: 'Verschachtelt'});

  // Also available
  await page.goto('/de/nested');
  page.getByRole('heading', {name: 'Verschachtelt'});

  const response = await request.get('/en/verschachtelt');
  expect(response.status()).toBe(404);
});

it('replaces invalid cookie locales', async ({request}) => {
  const response = await request.get('/', {
    maxRedirects: 0,
    headers: {
      cookie: 'NEXT_LOCALE=zh'
    }
  });
  expect(new URL(response.url()).pathname).toBe('/');
  expect(response.status()).toBe(200);
  expect(response.headers()['set-cookie']).toBe('NEXT_LOCALE=en; Path=/');
});

it('can localize route handlers', async ({request}) => {
  // Default
  {
    const response = await request.get('/api?name=world');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual({message: 'Hello world!'});
  }

  // German
  {
    const response = await request.get('/de/api?name=Welt');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual({message: 'Hallo Welt!'});
  }
});

// Unfortunately broken in newer Next.js versions (probably somewhere around ~13.3)
it.skip('can use caching headers', async ({request}) => {
  for (const pathname of ['/', '/nested', '/de', '/de/verschachtelt']) {
    expect((await request.get(pathname)).headers()['cache-control']).toBe(
      's-maxage=86400, stale-while-revalidate=31557600'
    );
  }
});

it('can use the formatter', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByTestId('CurrentTimeRelative')).toHaveText('now');
  await expect(page.getByTestId('Number')).toHaveText('€23,102.00');
});

it('populates metadata', async ({page}) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('next-intl example');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'This is an example of using next-intl in the `app` directory.'
  );
  await expect(page.locator('meta[name="currentYear"]')).toHaveAttribute(
    'content',
    '2023'
  );
});
