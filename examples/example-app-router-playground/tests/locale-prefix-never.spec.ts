import {test as it, expect} from '@playwright/test';

it('clears the router cache when changing the locale', async ({page}) => {
  await page.goto('/');

  async function expectDocumentLang(lang: string) {
    await page.locator(`html[lang="${lang}"]`).waitFor();
  }

  async function assertCookie(locale: string) {
    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe(
      locale
    );
  }

  await expectDocumentLang('en');

  await page.getByRole('link', {name: 'Client page'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('This page hydrates on the client side.')
  ).toBeAttached();
  await assertCookie('en');

  await page.getByRole('link', {name: 'Go to home'}).click();
  await expectDocumentLang('en');
  await expect(page).toHaveURL('/');
  await assertCookie('en');

  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expectDocumentLang('de');
  await assertCookie('de');

  await page.getByRole('link', {name: 'Client-Seite'}).click();
  await expectDocumentLang('de');
  await expect(page).toHaveURL('/client');
  await expect(
    page.getByText('Dise Seite wird auf der Client-Seite initialisiert.')
  ).toBeAttached();
  await assertCookie('de');
});
