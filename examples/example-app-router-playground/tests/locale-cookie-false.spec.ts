import {expect, test as it} from '@playwright/test';

it('never sets a cookie', async ({page}) => {
  async function expectNoCookie() {
    expect(
      (await page.context().cookies()).find((cur) => cur.name === 'NEXT_LOCALE')
    ).toBeUndefined();
  }

  await page.goto('/');
  await expectNoCookie();

  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('/de');
  await expectNoCookie();
});
