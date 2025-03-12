import {expect, test as it} from '@playwright/test';

it('syncs the locale across the public and private pages', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/en');
  await page.waitForSelector('html[lang="en"]');
  await page.getByRole('link', {name: /^DE$/}).click();
  await page.waitForSelector('html[lang="de"]');
  await page.getByRole('button', {name: 'Anmelden'}).click();

  await expect(page).toHaveURL('/app');
  await page.waitForSelector('html[lang="de"]');
  await page.getByRole('button', {name: /^EN$/}).click();
  await page.waitForSelector('html[lang="en"]');
  await page.getByRole('heading', {name: 'Home'}).waitFor();
  await page.getByRole('link', {name: 'Logout'}).click();

  await expect(page).toHaveURL('/en');
  await page.waitForSelector('html[lang="en"]');
  await page.getByRole('link', {name: /^DE$/}).click();
  await page.waitForSelector('html[lang="de"]');
  await page.getByRole('button', {name: 'Anmelden'}).click();

  await expect(page).toHaveURL('/app');
  await page.waitForSelector('html[lang="de"]');
});
