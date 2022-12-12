import {test as it, expect} from '@playwright/test';

it('handles i18n routing', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en/);

  // A cookie remembers the last locale
  await page.goto('/de');
  await page.goto('/');
  await expect(page).toHaveURL(/\/de/);

  await page.goto('/unknown');
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
