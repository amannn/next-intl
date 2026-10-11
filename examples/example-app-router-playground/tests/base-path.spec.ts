import {expect, test as it} from '@playwright/test';
import {assertLocaleCookieValue} from './utils';

it('updates the cookie correctly', async ({page}) => {
  await page.goto('/base/path');
  await assertLocaleCookieValue(page, undefined);

  await page.getByRole('button', {name: 'Go to nested page'}).click();
  await expect(page).toHaveURL('/base/path/nested');
  await page.getByRole('link', {name: 'Home'}).click();
  await page.getByRole('link', {name: 'Switch to German'}).click();

  await expect(page).toHaveURL('/base/path/de');
  await assertLocaleCookieValue(page, 'de', {path: '/base/path'});
  await page.getByRole('button', {name: 'Go to nested page'}).click();
  await expect(page).toHaveURL('/base/path/de/verschachtelt');
  await page.getByRole('link', {name: 'Start'}).click();
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();

  await expect(page).toHaveURL('/base/path');
  await assertLocaleCookieValue(page, 'en', {path: '/base/path'});
});

it('updates the cookie correctly when using the router', async ({page}) => {
  await page.goto('/base/path/client');
  await page.getByRole('button', {name: 'Switch to de'}).click();

  await expect(page).toHaveURL('/base/path/de/client');
  await assertLocaleCookieValue(page, 'de', {path: '/base/path'});
});

for (const navigation of ['Link', 'useRouter'] as const) {
  it(`syncs a single cookie at the base path before a server response with ${navigation}`, async ({
    context,
    page
  }) => {
    await page.goto(navigation === 'Link' ? '/base/path' : '/base/path/client');
    await context.addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: new URL(page.url()).hostname,
        path: '/base/path'
      }
    ]);

    // Check the client update independently of any middleware response.
    let resumeNavigation!: () => void;
    const pendingNavigation = new Promise<void>((resolve) => {
      resumeNavigation = resolve;
    });
    await page.route(
      (url) => url.pathname.startsWith('/base/path/de'),
      async (route) => {
        await pendingNavigation;
        await route.continue();
      }
    );

    try {
      const target =
        navigation === 'Link'
          ? page.getByRole('link', {name: 'Switch to German'})
          : page.getByRole('button', {name: 'Switch to de'});
      await target.click({noWaitAfter: true});

      // Check all matching cookies to also catch a duplicate at `/`.
      await expect
        .poll(async () =>
          (await context.cookies())
            .filter((cookie) => cookie.name === 'NEXT_LOCALE')
            .map(({path, value}) => ({path, value}))
        )
        .toEqual([{path: '/base/path', value: 'de'}]);
    } finally {
      resumeNavigation();
      await page.unrouteAll({behavior: 'wait'});
    }

    await expect(page).toHaveURL(
      navigation === 'Link' ? '/base/path/de' : '/base/path/de/client'
    );
  });
}

it('omits a base path from usePathname', async ({page}) => {
  await page.goto('/base/path/client');
  await expect(page.getByTestId('UnlocalizedPathname')).toHaveText('/client');
});

it('returns the correct canonical URL when using getPathname', async ({
  page
}) => {
  async function getCanonicalPathname() {
    const href = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    return new URL(href!).pathname;
  }

  await page.goto('/base/path/news/1');
  await expect(getCanonicalPathname()).resolves.toBe('/base/path/news/1');

  await page.goto('/base/path/de/neuigkeiten/1');
  await expect(getCanonicalPathname()).resolves.toBe(
    '/base/path/de/neuigkeiten/1'
  );
});
