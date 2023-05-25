import {test as it, expect} from '@playwright/test';

it('handles i18n routing', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');

  // A cookie remembers the last locale
  await page.goto('/de');
  await page.goto('/');
  await expect(page).toHaveURL('/de');
  await page
    .getByRole('combobox', {name: 'Sprache ändern'})
    .selectOption({label: 'Englisch'});

  await expect(page).toHaveURL('/');
  page.getByRole('heading', {name: 'next-intl example'});
});

it('handles not found pages', async ({page}) => {
  await page.goto('/unknown');
  page.getByRole('heading', {name: 'Page not found'});

  await page.goto('/de/unknown');
  page.getByRole('heading', {name: 'Seite nicht gefunden'});
});

it("handles not found pages for routes that don't match the middleware", async ({
  page
}) => {
  await page.goto('/test.png');
  page.getByRole('heading', {name: 'This page could not be found.'});
  await page.goto('/api/hello');
  page.getByRole('heading', {name: 'This page could not be found.'});
});

it('can be used to configure metadata', async ({page}) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('next-intl example');

  await page.goto('/de');
  await expect(page).toHaveTitle('next-intl Beispiel');
});

it('can be used to localize the page', async ({page}) => {
  await page.goto('/en');
  page.getByRole('heading', {name: 'next-intl example'});

  await page.goto('/de');
  page.getByRole('heading', {name: 'next-intl Beispiel'});
});

it('sets a cookie', async ({page}) => {
  const response = await page.goto('/');
  expect(await response?.headerValue('set-cookie')).toBe(
    'NEXT_LOCALE=en; Path=/; SameSite=strict'
  );
});
