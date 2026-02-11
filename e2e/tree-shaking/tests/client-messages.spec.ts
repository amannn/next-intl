import {expect, test as it, type Page} from '@playwright/test';

const groupPageMessages = [
  {
    '0A97lp': 'Group (one) page',
    'ntVPJ+': 'Group (two) page'
  }
] as const;

const HARD_ROUTE_CASES = [
  {
    pathname: '/',
    messages: [
      {
        jm1lmy: ['Count: ', ['count', 4]],
        tQLRmz: 'Increment'
      }
    ]
  },
  {
    pathname: '/loading',
    messages: [
      {
        o6jHkb: 'Loading page \u2026'
      }
    ]
  },
  {
    pathname: '/dynamic-segment/test',
    messages: [
      {
        mrNFad: ['Dynamic slug page: ', ['slug']]
      }
    ]
  },
  {
    pathname: '/catch-all/a/b/c',
    messages: [
      {
        xmCXAl: ['Catch-all page: ', ['segment']]
      }
    ]
  },
  {
    pathname: '/optional/x/y',
    messages: [
      {
        bT9Pga: ['Optional catch-all page: ', ['segment']]
      }
    ]
  },
  {
    pathname: '/actions',
    messages: [
      {
        'RNB4/W': 'Load lazy content'
      }
    ]
  },
  {
    pathname: '/type-imports',
    messages: [
      {
        GO9hSh: ['Test label: ', ['value']]
      }
    ]
  },
  {pathname: '/group-one', messages: groupPageMessages},
  {pathname: '/group-two', messages: groupPageMessages},
  {
    pathname: '/parallel',
    messages: [
      {
        '62nsdy': 'Retry',
        'zZQM/j': 'Parallel activity default (client)',
        E8vtaB: 'Parallel page',
        eoEXj3: 'Parallel activity page (client)',
        fJxh6G: 'Parallel template',
        ox304v: 'An error occurred'
      }
    ]
  },
  {
    pathname: '/feed',
    messages: [
      {
        I6Uu2z: 'Feed page',
        Z2Vmmr: 'Feed modal default'
      }
    ]
  },
  {
    pathname: '/photo/alpha',
    messages: [
      {
        o25lsU: ['Photo page: ', ['id']]
      }
    ]
  },
  {
    pathname: '/dynamic-import',
    messages: [
      {
        TghmPk: 'Dynamic imported client',
        cOlyBM: 'Lazy imported client'
      }
    ]
  },
  {
    pathname: '/hook-translation',
    messages: [
      {
        'd4JN/R': 'Hook test label'
      }
    ]
  },
  {
    pathname: '/layout-template',
    messages: [
      {
        '30s0PJ': 'Layout template template',
        bowxvu: 'Layout template page'
      }
    ]
  },
  {
    pathname: '/shared-component',
    messages: [
      {
        JdTriE: 'Shared component'
      }
    ]
  },
  {
    pathname: '/use-translations',
    messages: [
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
    ]
  }
] as const;

async function readProviderClientMessages(
  page: Page
): Promise<Array<Record<string, unknown>>> {
  const providerMessages = page.locator('[data-id="provider-client-messages"]');
  await expect(providerMessages.first()).toBeVisible();

  const providerCount = await providerMessages.count();
  const messages: Array<Record<string, unknown>> = [];

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

    messages.push(parsedProviderText as Record<string, unknown>);
  }

  return messages;
}

it.describe('Provider client messages', () => {
  for (const hardRouteCase of HARD_ROUTE_CASES) {
    it(`hard load ${hardRouteCase.pathname}`, async ({page}) => {
      await page.goto(hardRouteCase.pathname);
      const messages = await readProviderClientMessages(page);
      expect(messages).toEqual(hardRouteCase.messages);
    });
  }

  it('soft navigate /feed -> /photo/alpha', async ({page}) => {
    await page.goto('/feed');
    await page.locator('a[href="/photo/alpha"]').first().click();
    await expect(page).toHaveURL('/photo/alpha');

    const messages = await readProviderClientMessages(page);
    expect(messages).toEqual([
      {
        I6Uu2z: 'Feed page',
        Z2Vmmr: 'Feed modal default'
      },
      {
        Ax7uMP: ['Intercepted photo modal: ', ['id']]
      }
    ]);
  });
});
