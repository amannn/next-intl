import {test as it, expect} from '@playwright/test';

it('handles unknown locales', async ({page}) => {
  await page.goto('/unknown');
  await expect(page).toHaveURL(/\/en/);
});

it('redirects to a matched locale', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en/);
});

it('remembers the last locale', async ({page}) => {
  await page.goto('/de');

  // Wait for the cookie to be set on the client side
  await expect(async () => {
    const cookie = (await page.context().cookies()).find(
      (cur) => cur.name === 'NEXT_LOCALE'
    );
    expect(cookie).toMatchObject({
      name: 'NEXT_LOCALE',
      value: 'de'
    });
  }).toPass();

  await page.goto('/');
  await expect(page).toHaveURL(/\/de/);
});

it('sets the `lang` attribute on `html`', async ({page}) => {
  await page.goto('/en');
  await page.waitForSelector('html[lang="en"]');
});

it('can be used in the head', async ({page}) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('next-intl example');

  await page.goto('/de');
  await expect(page).toHaveTitle('next-intl Beispiel');
});

it('can be used to localize the page', async ({page}) => {
  await page.goto('/en');
  page.locator('text=This is the home page.');

  await page.goto('/de');
  page.locator('text=Das ist die Startseite.');
});

it('can pass internationalized labels to a client component', async ({
  page
}) => {
  await page.goto('/en');
  const element = page.getByTestId('MessagesAsPropsCount');
  await expect(element).toHaveText(/Current count: 0/);
  await element.getByRole('button', {name: 'Increment'}).click();
  await expect(element).toHaveText(/Current count: 1/);
});

it('can use next-intl on the client side', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('MessagesOnClientCounter');
  await expect(element).toHaveText(/Current count: 0/);
  await element.getByRole('button', {name: 'Increment'}).click();
  await expect(element).toHaveText(/Current count: 1/);
});

it('can use rich text', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('RichText');
  expect(await element.innerHTML()).toBe('This is a <b>rich</b> text.');
});

it('can use raw text', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('RawText');
  expect(await element.innerHTML()).toBe(
    'This is a <important>rich</important> text.'
  );
});

it('can use global defaults', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('GlobalDefaults');
  expect(await element.innerHTML()).toBe('<strong>Global string</strong>');
});

it('can use `getMessageFallback`', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('MissingMessage');
  expect(await element.innerHTML()).toBe(
    '`getMessageFalback` called for Index.missing'
  );
});

it('can use the core library', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('CoreLibrary');
  await expect(element).toHaveText('Relative time: tomorrow');
});

it('can use `LocalizedLink` on the server', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByRole('link', {name: 'Home'})).toHaveAttribute(
    'href',
    '/en'
  );
  await expect(page.getByRole('link', {name: 'Nested page'})).toHaveAttribute(
    'href',
    '/en/nested'
  );
});

it('can use `LocalizedLink` to link to the root of another language', async ({
  page
}) => {
  await page.goto('/en');
  await expect(
    page.getByRole('link', {name: 'Switch to German'})
  ).toHaveAttribute('href', '/de');
});

it('can use `LocalizedLink` on the client', async ({page}) => {
  await page.goto('/en/client');
  await expect(page.getByRole('link', {name: 'Go to home'})).toHaveAttribute(
    'href',
    '/en'
  );
});

it('can navigate between sibling pages that share a parent layout', async ({
  page
}) => {
  await page.goto('/en/nested');
  await page.getByRole('link', {name: 'Client page'}).click();
  await expect(page).toHaveURL(/\/en\/client/);
  await page.getByRole('link', {name: 'Nested page'}).click();
  await expect(page).toHaveURL(/\/en\/nested/);
});

it('can supply static values for runtime config', async ({page}) => {
  await page.goto('/en');
  const element = page.getByTestId('StaticRuntimeConfig');
  await expect(element).toHaveText('Jan 1, 2020, 01:00 (Europe/Vienna)');
});
