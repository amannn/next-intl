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

  // Navigate to client page - should have no prefix
  await page.getByRole('link', {name: 'Client page'}).click();
  await expect(page).toHaveURL('http://never.example.com/client');

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
        'accept-language': 'nl',
        'x-forwarded-port': '80'
      }
    })
  );

  // Default locale (nl) should have prefix with always mode
  await page.goto('http://always.example.com');
  await expect(page).toHaveURL('http://always.example.com/nl');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // Non-default locale (de) should also have prefix
  await page.getByRole('link', {name: 'Schakel naar Duits'}).click();
  await expect(page).toHaveURL('http://always.example.com/de');
  await expect(page.getByRole('heading', {name: 'Start'})).toBeVisible();

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
  await expect(page.getByRole('heading', {name: 'Home (ja)'})).toBeVisible();

  // Non-default locale (es) should have prefix
  await page.getByRole('link', {name: 'Switch to Spanish'}).click();
  await expect(page).toHaveURL('http://as-needed.example.com/spain');
  await expect(page.getByRole('heading', {name: 'Inicio'})).toBeVisible();

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
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // Navigate to always.example.com with accept-language: nl
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'nl',
        'x-forwarded-port': '80'
      }
    })
  );
  await page.goto('http://always.example.com');
  await expect(page).toHaveURL('http://always.example.com/nl');
  await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();

  // Navigate to as-needed.example.com with accept-language: ja
  await page.route('**/*', (route) =>
    route.continue({
      headers: {
        'accept-language': 'ja',
        'x-forwarded-port': '80'
      }
    })
  );
  await page.goto('http://as-needed.example.com');
  await expect(page).toHaveURL('http://as-needed.example.com');
  await expect(page.getByRole('heading', {name: 'Home (ja)'})).toBeVisible();

  await browser.close();
});
