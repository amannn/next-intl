import {test as it, expect} from '@playwright/test';

it.describe.configure({mode: 'parallel'});

it('clears the router cache when changing the locale', async ({page}) => {
  await page.goto('/');

  async function expectDocumentLang(lang: string) {
    await expect(page.locator(`html[lang="${lang}"]`)).toBeAttached();
  }

  await expectDocumentLang('en');

  await page.getByRole('link', {name: 'Client page'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('This page hydrates on the client side.')
  ).toBeAttached();

  await page.getByRole('link', {name: 'Go to home'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/');

  await page.getByRole('link', {name: 'Switch to German'}).click();

  await expectDocumentLang('de');

  await page.getByRole('link', {name: 'Client-Seite'}).click();
  await expectDocumentLang('de');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('Dise Seite wird auf der Client-Seite initialisiert.')
  ).toBeAttached();
});
