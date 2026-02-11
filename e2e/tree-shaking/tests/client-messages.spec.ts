import {expect, test as it, type Page} from '@playwright/test';

type ProviderClientMessage = Record<string, unknown>;
type HardRouteCase = {
  expectedClientMessages: Array<ProviderClientMessage>;
  pathname: string;
};

const GROUP_PAGE_CLIENT_MESSAGES: Array<ProviderClientMessage> = [
  {
    '0A97lp': 'Group (one) page',
    'ntVPJ+': 'Group (two) page'
  }
];

const HARD_ROUTE_CASES: Array<HardRouteCase> = [
  {
    expectedClientMessages: [
      {
        jm1lmy: ['Count: ', ['count', 4]],
        tQLRmz: 'Increment'
      }
    ],
    pathname: '/'
  },
  {
    expectedClientMessages: [
      {
        o6jHkb: 'Loading page \u2026'
      }
    ],
    pathname: '/loading'
  },
  {
    expectedClientMessages: [
      {
        mrNFad: ['Dynamic slug page: ', ['slug']]
      }
    ],
    pathname: '/dynamic-segment/test'
  },
  {
    expectedClientMessages: [
      {
        xmCXAl: ['Catch-all page: ', ['segment']]
      }
    ],
    pathname: '/catch-all/a/b/c'
  },
  {
    expectedClientMessages: [
      {
        bT9Pga: ['Optional catch-all page: ', ['segment']]
      }
    ],
    pathname: '/optional/x/y'
  },
  {
    expectedClientMessages: [
      {
        'RNB4/W': 'Load lazy content'
      }
    ],
    pathname: '/actions'
  },
  {
    expectedClientMessages: [
      {
        GO9hSh: ['Test label: ', ['value']]
      }
    ],
    pathname: '/type-imports'
  },
  {expectedClientMessages: GROUP_PAGE_CLIENT_MESSAGES, pathname: '/group-one'},
  {expectedClientMessages: GROUP_PAGE_CLIENT_MESSAGES, pathname: '/group-two'},
  {
    expectedClientMessages: [
      {
        '62nsdy': 'Retry',
        'zZQM/j': 'Parallel activity default (client)',
        E8vtaB: 'Parallel page',
        eoEXj3: 'Parallel activity page (client)',
        fJxh6G: 'Parallel template',
        ox304v: 'An error occurred'
      }
    ],
    pathname: '/parallel'
  },
  {
    expectedClientMessages: [
      {
        I6Uu2z: 'Feed page',
        Z2Vmmr: 'Feed modal default'
      }
    ],
    pathname: '/feed'
  },
  {
    expectedClientMessages: [
      {
        o25lsU: ['Photo page: ', ['id']]
      }
    ],
    pathname: '/photo/alpha'
  },
  {
    expectedClientMessages: [
      {
        TghmPk: 'Dynamic imported client',
        cOlyBM: 'Lazy imported client'
      }
    ],
    pathname: '/dynamic-import'
  },
  {
    expectedClientMessages: [
      {
        'd4JN/R': 'Hook test label'
      }
    ],
    pathname: '/hook-translation'
  },
  {
    expectedClientMessages: [
      {
        '30s0PJ': 'Layout template template',
        bowxvu: 'Layout template page'
      }
    ],
    pathname: '/layout-template'
  },
  {
    expectedClientMessages: [
      {
        JdTriE: 'Shared component'
      }
    ],
    pathname: '/shared-component'
  },
  {
    expectedClientMessages: [
      {
        DynamicKey: {
          description: 'useTranslations: dynamic key (unused)',
          title: 'useTranslations: dynamic key'
        },
        GlobalNamespace: {
          title: 'useTranslations: global namespace'
        },
        UseTranslationsPage: {
          title: 'useTranslations: static'
        }
      }
    ],
    pathname: '/use-translations'
  }
];

const PHOTO_ALPHA_SOFT_FROM_FEED_CLIENT_MESSAGES: Array<ProviderClientMessage> =
  [
    {
      I6Uu2z: 'Feed page',
      Z2Vmmr: 'Feed modal default'
    },
    {
      Ax7uMP: ['Intercepted photo modal: ', ['id']]
    }
  ];

async function readProviderClientMessages(
  page: Page
): Promise<Array<ProviderClientMessage>> {
  const providerMessages = page.locator('[data-id="provider-client-messages"]');
  await expect(providerMessages.first()).toBeVisible();

  const providerCount = await providerMessages.count();
  const clientMessages: Array<ProviderClientMessage> = [];

  for (let index = 0; index < providerCount; index++) {
    const providerText = await providerMessages.nth(index).textContent();
    if (providerText == null) {
      throw new Error(`Missing text for provider index ${index}`);
    }

    const parsedProviderText: unknown = JSON.parse(providerText.trim());
    if (
      parsedProviderText == null ||
      Array.isArray(parsedProviderText) ||
      typeof parsedProviderText !== 'object'
    ) {
      throw new Error(`Expected object for provider index ${index}`);
    }

    clientMessages.push(parsedProviderText as ProviderClientMessage);
  }

  return clientMessages;
}

it.describe('Provider client messages', () => {
  for (const hardRouteCase of HARD_ROUTE_CASES) {
    it(`hard load ${hardRouteCase.pathname}`, async ({page}) => {
      await page.goto(hardRouteCase.pathname);
      const clientMessages = await readProviderClientMessages(page);
      expect(clientMessages).toEqual(hardRouteCase.expectedClientMessages);
    });
  }

  it('soft navigate /feed -> /photo/alpha', async ({page}) => {
    await page.goto('/feed');
    await page.locator('a[href="/photo/alpha"]').first().click();
    await expect(page).toHaveURL('/photo/alpha');

    const clientMessages = await readProviderClientMessages(page);
    expect(clientMessages).toEqual(PHOTO_ALPHA_SOFT_FROM_FEED_CLIENT_MESSAGES);
  });
});
