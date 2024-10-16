import {test as it, expect} from '@playwright/test';
import {assertLocaleCookieValue} from './utils';

it('updates the cookie correctly', async ({page}) => {
  await page.goto('/base/path');
  await assertLocaleCookieValue(page, 'en', {path: '/base/path'});

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
