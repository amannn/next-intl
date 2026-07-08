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
  assertLocaleCookieValue(page, 'de', {path: '/base/path'});
  await page.getByRole('button', {name: 'Go to nested page'}).click();
  await expect(page).toHaveURL('/base/path/de/verschachtelt');
  await page.getByRole('link', {name: 'Start'}).click();
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();

  await expect(page).toHaveURL('/base/path');
  assertLocaleCookieValue(page, 'en', {path: '/base/path'});
});

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
