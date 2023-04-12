import {test as it, expect} from '@playwright/test';

it('handles i18n routing', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');

  // A cookie remembers the last locale
  await page.goto('/de');
  await page.goto('/');
  await expect(page).toHaveURL('/de');
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();
  await expect(page).toHaveURL('/');
  page.getByRole('heading', {name: 'This is the home page.'});

  await page.goto('/unknown');
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
  page.getByRole('heading', {name: 'This is the home page.'});

  await page.goto('/de');
  page.getByRole('heading', {name: 'Das ist die Startseite.'});
});
