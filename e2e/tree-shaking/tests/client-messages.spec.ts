import {expect, test as it, type Page} from '@playwright/test';

const groupPageMessages = [
  {
    '0A97lp': 'Group (one) page',
    'ntVPJ+': 'Group (two) page'
  }
] as const;

const routesMap = {
  '/': [
    {
      jm1lmy: ['Count: ', ['count', 4]],
      tQLRmz: 'Increment'
    }
  ],
  '/loading': [
    {
      o6jHkb: 'Loading page \u2026'
    }
  ],
  '/dynamic-segment/test': [
    {
      mrNFad: ['Dynamic slug page: ', ['slug']]
    }
  ],
  '/explicit-id': [
    {
      carousel: {
        next: 'Right'
      }
    }
  ],
  '/catch-all/a/b/c': [
    {
      xmCXAl: ['Catch-all page: ', ['segment']]
    }
  ],
  '/optional/x/y': [
    {
      bT9Pga: ['Optional catch-all page: ', ['segment']]
    }
  ],
  '/actions': [
    {
      'RNB4/W': 'Load lazy content'
    }
  ],
  '/type-imports': [
    {
      GO9hSh: ['Test label: ', ['value']]
    }
  ],
  '/group-one': groupPageMessages,
  '/group-two': groupPageMessages,
  '/parallel': [
    {
      '62nsdy': 'Retry',
      'zZQM/j': 'Parallel activity default (client)',
      E8vtaB: 'Parallel page',
      eoEXj3: 'Parallel activity page (client)',
      fJxh6G: 'Parallel template',
      ox304v: 'An error occurred'
    }
  ],
  '/feed': [
    {
      I6Uu2z: 'Feed page',
      Z2Vmmr: 'Feed modal default'
    }
  ],
  '/photo/alpha': [
    {
      o25lsU: ['Photo page: ', ['id']]
    }
  ],
  '/dynamic-import': [
    {
      TghmPk: 'Dynamic imported client',
      cOlyBM: 'Lazy imported client'
    }
  ],
  '/hook-translation': [
    {
      'd4JN/R': 'Hook test label'
    }
  ],
  '/layout-template': [
    {
      '30s0PJ': 'Layout template template',
      bowxvu: 'Layout template page'
    }
  ],
  '/shared-component': [
    {
      JdTriE: 'Shared component'
    }
  ],
  '/use-translations': [
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
} as const;

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

it.describe('provider client messages', () => {
  for (const [pathname, expectedMessages] of Object.entries(routesMap)) {
    it(`has matching messages for ${pathname}`, async ({page}) => {
      await page.goto(pathname);
      const messages = await readProviderClientMessages(page);
      expect(messages).toEqual(expectedMessages);
    });
  }

  it('has matching messages for soft navigation of /feed -> /photo/alpha', async ({
    page
  }) => {
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
