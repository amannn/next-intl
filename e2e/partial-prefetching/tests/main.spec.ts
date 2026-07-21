import {type Page, expect, test as it} from '@playwright/test';

function getLocaleCookieValue(page: Page) {
  // The router of Next.js keeps the DOM of previously visited
  // routes around, therefore only consider the visible element
  return page.getByTestId('LocaleCookieValue').filter({visible: true});
}

it('supports navigation and locale switching', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // The locale cookie is streamed in and not part of the shell
  await expect(getLocaleCookieValue(page)).toHaveText('none');

  // Detects a full page load
  await page.evaluate(() => {
    // @ts-expect-error -- Only used in this test
    window.spa = true;
  });

  await page.getByRole('link', {name: 'Go to about page'}).click();
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', {name: 'About'})).toBeVisible();

  await page.getByRole('link', {name: 'Go to home page'}).click();
  await expect(page).toHaveURL('/');

  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('/de');
  await expect(page.getByRole('heading', {name: 'Startseite'})).toBeVisible();
  await expect(getLocaleCookieValue(page)).toHaveText('de');

  // All navigations were client-side
  const isSpa = await page.evaluate(
    // @ts-expect-error -- Only used in this test
    () => window.spa
  );
  expect(isSpa).toBe(true);
});
