import {chromium, expect, test as it} from '@playwright/test';

it('can use config based on the default locale on an unknown domain', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();
  await expect(page).toHaveURL('/');
  await page.getByRole('link', {name: 'Client page'}).click();
  await expect(page).toHaveURL('/client');

  await page.goto('/');
  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('/de');
});

it('can use a secondary locale unprefixed if the domain has specified it as the default locale', async () => {
  const browser = await chromium.launch({
    args: ['--host-resolver-rules=MAP example.de 127.0.0.1:' + process.env.PORT]
  });

  const page = await browser.newPage();
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'de',
        'x-forwarded-port': '80' // (playwright default)
      }
    })
  );

  await page.goto('http://example.de');
  await expect(page).toHaveURL('http://example.de'); // (no redirect)
  await expect(page.getByRole('heading', {name: 'Start'})).toBeVisible();
  await page.getByRole('link', {name: 'Client-Seite'}).click();
  await expect(page).toHaveURL('http://example.de/client');
  await page.getByRole('link', {name: 'Start'}).click();
  await expect(page).toHaveURL('http://example.de');
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();
  await expect(page).toHaveURL('http://example.com/en');
});
