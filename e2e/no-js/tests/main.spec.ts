import {type Page, expect, test as it} from '@playwright/test';

// The cookie is expected to be updated via the middleware
// in this case, purely based on document requests
it.use({javaScriptEnabled: false});

async function getLocaleCookieValue(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cur) => cur.name === 'NEXT_LOCALE')?.value;
}

it('can switch the locale and update the cookie without JavaScript', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.getByTestId('locale')).toHaveText('en');
  expect(await getLocaleCookieValue(page)).toBeUndefined();

  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('/de');
  await expect(page.getByTestId('locale')).toHaveText('de');
  expect(await getLocaleCookieValue(page)).toBe('de');

  await page.getByRole('link', {name: 'Switch to English'}).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('locale')).toHaveText('en');
  expect(await getLocaleCookieValue(page)).toBe('en');
});
