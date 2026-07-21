import {expect, test as it} from '@playwright/test';

// Regression test for https://github.com/amannn/next-intl/discussions/2209#discussioncomment-17687273
//
// When `experimental.messages.precompile` is enabled and `next-intl/plugin` is
// used through a workspace wrapper package (see `next.config.ts`), running
// `bun --bun next dev` previously failed to load `next.config` with:
//
//   Cannot find module 'use-intl/format-message/format-only'
//
// The plugin resolves the `format-only` build via `require.resolve`
// (`createRequire(import.meta.url)`). When Next.js bundles the config before
// evaluating it, `import.meta.url` is unavailable, so the resolution base is
// empty and `require.resolve` throws.
//
// The dev server for this test runs on Bun (see `playwright.config.ts`).
// Asserting the formatted output also ensures that the
// `use-intl/format-message` alias is actually applied — if it isn't,
// precompiled messages fail to format.

it('formats a precompiled message', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Hello Jane!'})).toBeVisible();
});
