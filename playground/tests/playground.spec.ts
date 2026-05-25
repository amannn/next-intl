import { test, expect } from '@playwright/test';

test('landing renders in en and de', async ({ page }) => {
  await page.goto('/en');
  await expect(
    page.getByRole('heading', { name: /Playground/i }),
  ).toBeVisible();

  await page.goto('/de');
  await expect(
    page.getByRole('heading', { name: /Playground/i }),
  ).toBeVisible();
});

test('Server Components page shows the live demo greeting', async ({
  page,
}) => {
  await page.goto('/en/translations/server-components');
  await expect(page.getByText('Hello, world!')).toBeVisible();

  await page.goto('/de/translations/server-components');
  await expect(page.getByText('Hallo, Welt!')).toBeVisible();
});

test('Client Components page renders demo and reacts to input', async ({
  page,
}) => {
  await page.goto('/en/translations/client-components');
  const input = page.getByPlaceholder('Frodo');
  await input.fill('Sam');
  await expect(page.getByText('Hello, Sam!')).toBeVisible();
});
