import {expect, test as it} from '@playwright/test';
import {assertLocaleCookieValue} from './utils';

it('clears the router cache when changing the locale', async ({page}) => {
  await page.goto('/');

  async function expectDocumentLang(lang: string) {
    await page.locator(`html[lang="${lang}"]`).waitFor();
  }

  await expectDocumentLang('en');

  await page.getByRole('link', {name: 'Client page'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('This page hydrates on the client side.')
  ).toBeAttached();
  await assertLocaleCookieValue(page, undefined);

  await page.getByRole('link', {name: 'Go to home'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/');
  await assertLocaleCookieValue(page, undefined);

  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expectDocumentLang('de');
  await assertLocaleCookieValue(page, 'de');

  await page.getByRole('link', {name: 'Client-Seite'}).click();
  await expectDocumentLang('de');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('Dise Seite wird auf der Client-Seite initialisiert.')
  ).toBeAttached();
  await assertLocaleCookieValue(page, 'de');
});
