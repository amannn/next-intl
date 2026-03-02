import {chromium, expect, test as it} from '@playwright/test';

it('uses localePrefix never mode on never.example.com', async () => {
  const browser = await chromium.launch({
    args: [
      '--host-resolver-rules=MAP never.example.com 127.0.0.1:' +
        process.env.PORT
    ]
  });

  const page = await browser.newPage();
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'en',
        'x-forwarded-port': '80'
      }
    })
  );

  // Default locale (en) should have no prefix
  await page.goto('http://never.example.com');
  await expect(page).toHaveURL('http://never.example.com');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // Non-default locale (de) should also have no prefix
  await page.goto('http://never.example.com/de');
  await expect(page).toHaveURL('http://never.example.com');
  await expect(page.getByRole('heading', {name: 'Start'})).toBeVisible();

  await browser.close();
});

it('uses localePrefix always mode on always.example.com', async () => {
  const browser = await chromium.launch({
    args: [
      '--host-resolver-rules=MAP always.example.com 127.0.0.1:' +
        process.env.PORT
    ]
  });

  const page = await browser.newPage();
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'de',
        'x-forwarded-port': '80'
      }
    })
  );

  // Default locale (de) should have prefix
  await page.goto('http://always.example.com');
  await expect(page).toHaveURL('http://always.example.com/de');
  await expect(page.getByRole('heading', {name: 'Start'})).toBeVisible();

  // Non-default locale (en) should also have prefix
  await page.getByRole('link', {name: 'Zu Englisch wechseln'}).click();
  await expect(page).toHaveURL('http://always.example.com/en');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  await browser.close();
});

it('uses localePrefix as-needed mode on as-needed.example.com', async () => {
  const browser = await chromium.launch({
    args: [
      '--host-resolver-rules=MAP as-needed.example.com 127.0.0.1:' +
        process.env.PORT
    ]
  });

  const page = await browser.newPage();
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'ja',
        'x-forwarded-port': '80'
      }
    })
  );

  // Default locale (ja) should have no prefix
  await page.goto('http://as-needed.example.com');
  await expect(page).toHaveURL('http://as-needed.example.com');
  await expect(page.getByRole('heading', {name: 'ホーム'})).toBeVisible();

  // Non-default locale (en) should have prefix
  await page.getByRole('link', {name: '英語に切り替える'}).click();
  await expect(page).toHaveURL('http://as-needed.example.com/en');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  await browser.close();
});

it('navigates between domains with different localePrefix modes', async () => {
  const browser = await chromium.launch({
    args: [
      '--host-resolver-rules=MAP never.example.com 127.0.0.1:' +
        process.env.PORT +
        ',MAP always.example.com 127.0.0.1:' +
        process.env.PORT +
        ',MAP as-needed.example.com 127.0.0.1:' +
        process.env.PORT
    ]
  });

  const page = await browser.newPage();
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'en',
        'x-forwarded-port': '80'
      }
    })
  );

  // Start on never.example.com (no prefix for en)
  await page.goto('http://never.example.com');
  await expect(page).toHaveURL('http://never.example.com');

  // Switch to German - should stay on never.example.com with no prefix
  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('http://never.example.com');
  await expect(page.getByRole('heading', {name: 'Start'})).toBeVisible();

  // Navigate to always.example.com with accept-language: en - should redirect to /en
  await page.goto('http://always.example.com');
  await expect(page).toHaveURL('http://always.example.com/en');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // Switch to German - should have /de prefix
  await page.getByRole('link', {name: 'Switch to German'}).click();
  await expect(page).toHaveURL('http://always.example.com/de');

  await browser.close();
});
