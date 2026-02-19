import {expect, test as it} from '@playwright/test';

// Manifest is now injected as __inferredManifest prop per provider (no file).
// Verify app works by checking provider messages are correctly tree-shaken.
it('provider receives inferred messages from injected manifest', async ({
  page
}) => {
  await page.goto('/');
  const messages = await page
    .locator('[data-id="provider-client-messages"]')
    .first()
    .textContent();
  expect(messages).toBeTruthy();
  const parsed = JSON.parse(messages!);
  expect(parsed).toHaveProperty('jm1lmy');
  expect(parsed).toHaveProperty('tQLRmz');
});
