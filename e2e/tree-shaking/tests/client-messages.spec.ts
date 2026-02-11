import {expect, test as it, type Page} from '@playwright/test';

type HardRouteCase = {
  pathname: string;
  snapshotFileName: string;
};

const HARD_ROUTE_CASES: Array<HardRouteCase> = [
  {pathname: '/', snapshotFileName: 'home.hard.json'},
  {pathname: '/loading', snapshotFileName: 'loading.hard.json'},
  {
    pathname: '/dynamic-segment/test',
    snapshotFileName: 'dynamic-segment-test.hard.json'
  },
  {
    pathname: '/catch-all/a/b/c',
    snapshotFileName: 'catch-all-a-b-c.hard.json'
  },
  {pathname: '/optional/x/y', snapshotFileName: 'optional-x-y.hard.json'},
  {pathname: '/actions', snapshotFileName: 'actions.hard.json'},
  {pathname: '/type-imports', snapshotFileName: 'type-imports.hard.json'},
  {pathname: '/group-one', snapshotFileName: 'group-one.hard.json'},
  {pathname: '/group-two', snapshotFileName: 'group-two.hard.json'},
  {pathname: '/parallel', snapshotFileName: 'parallel.hard.json'},
  {pathname: '/feed', snapshotFileName: 'feed.hard.json'},
  {pathname: '/photo/alpha', snapshotFileName: 'photo-alpha.hard.json'},
  {pathname: '/dynamic-import', snapshotFileName: 'dynamic-import.hard.json'},
  {
    pathname: '/hook-translation',
    snapshotFileName: 'hook-translation.hard.json'
  },
  {pathname: '/layout-template', snapshotFileName: 'layout-template.hard.json'},
  {
    pathname: '/shared-component',
    snapshotFileName: 'shared-component.hard.json'
  },
  {
    pathname: '/use-translations',
    snapshotFileName: 'use-translations.hard.json'
  }
];

async function readProviderClientMessages(page: Page): Promise<Array<string>> {
  const providerMessages = page.locator('[data-id="provider-client-messages"]');
  await expect(providerMessages.first()).toBeVisible();

  const providerCount = await providerMessages.count();
  const clientMessages: Array<string> = [];

  for (let index = 0; index < providerCount; index++) {
    const providerText = await providerMessages.nth(index).textContent();
    if (providerText == null) {
      throw new Error(`Missing text for provider index ${index}`);
    }

    clientMessages.push(providerText.trim());
  }

  return clientMessages;
}

function expectClientMessagesSnapshot(
  clientMessages: Array<string>,
  snapshotFileName: string
) {
  expect(JSON.stringify(clientMessages, null, 2)).toMatchSnapshot(
    snapshotFileName
  );
}

it.describe('Provider client messages', () => {
  for (const hardRouteCase of HARD_ROUTE_CASES) {
    it(`hard load ${hardRouteCase.pathname}`, async ({page}) => {
      await page.goto(hardRouteCase.pathname);
      const clientMessages = await readProviderClientMessages(page);
      expectClientMessagesSnapshot(
        clientMessages,
        hardRouteCase.snapshotFileName
      );
    });
  }

  it('soft navigate /feed -> /photo/alpha', async ({page}) => {
    await page.goto('/feed');
    await page.locator('a[href="/photo/alpha"]').first().click();
    await expect(page).toHaveURL('/photo/alpha');

    const clientMessages = await readProviderClientMessages(page);
    expectClientMessagesSnapshot(
      clientMessages,
      'photo-alpha.soft-from-feed.json'
    );
  });
});
