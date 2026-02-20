import {expect, test as it, type Page} from '@playwright/test';
import {writeFileSync} from 'fs';
import {join} from 'path';

const {describe} = it;

const HMR_TEST_CONTENT_PATH = join(
  process.cwd(),
  'src/app/hmr-test/HmrTestContent.tsx'
);

const routesMap = {
  '/': [
    {
      jm1lmy: ['Count: ', ['count', 4]],
      tQLRmz: 'Increment'
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
  '/group-one': [
    {
      '0A97lp': 'Group (one) page'
    }
  ],
  '/group-two': [
    {
      'ntVPJ+': 'Group (two) page'
    }
  ],
  '/parallel': [
    {
      fJxh6G: 'Parallel template'
    }
  ],
  '/feed': [
    {
      I6Uu2z: 'Feed page'
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
    {'30s0PJ': 'Layout template template'},
    {bowxvu: 'Layout template page'}
  ],
  '/linked-dependency': [
    {
      'Cq+Nds': 'Profile card'
    }
  ],
  '/multi-provider': [
    {'0tkhmz': 'Multi provider one'},
    {Kjbz3y: 'Multi provider two'}
  ],
  '/server-only': [{}],
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
  ],
  '/global-not-found': [
    {
      QRccCM: 'Page not found'
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

function providerMatchesExactly(
  provider: Record<string, unknown>,
  expected: Record<string, unknown>
): boolean {
  const providerKeys = Object.keys(provider);
  const expectedKeys = Object.keys(expected);
  if (providerKeys.length !== expectedKeys.length) return false;
  for (const key of expectedKeys) {
    if (!(key in provider)) return false;
    const pv = provider[key];
    const ev = expected[key];
    if (typeof ev === 'object' && ev !== null && !Array.isArray(ev)) {
      if (
        typeof pv !== 'object' ||
        pv === null ||
        Array.isArray(pv) ||
        !providerMatchesExactly(
          pv as Record<string, unknown>,
          ev as Record<string, unknown>
        )
      ) {
        return false;
      }
    } else if (JSON.stringify(pv) !== JSON.stringify(ev)) {
      return false;
    }
  }
  return true;
}

function messagesContainValue(
  messages: Array<Record<string, unknown>>,
  value: string
): boolean {
  function check(obj: Record<string, unknown>): boolean {
    for (const v of Object.values(obj)) {
      if (v === value) return true;
      if (Array.isArray(v) && v[0] === value) return true;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        if (check(v as Record<string, unknown>)) return true;
      }
    }
    return false;
  }
  return messages.some((m) => check(m));
}

describe('provider client messages', () => {
  for (const [pathname, expectedMessages] of Object.entries(routesMap)) {
    it(`renders exactly expected messages for ${pathname}`, async ({page}) => {
      await page.goto(pathname);
      const messages = await readProviderClientMessages(page);
      const unmatchedExpected = expectedMessages.filter(
        (expected) => !messages.some((m) => providerMatchesExactly(m, expected))
      );
      const hasExactMatch = unmatchedExpected.length === 0;
      expect(
        hasExactMatch,
        `No provider had exactly expected messages for ${pathname}\n` +
          `Expected (${expectedMessages.length}):\n${JSON.stringify(expectedMessages, null, 2)}\n` +
          `Actual (${messages.length} providers):\n${JSON.stringify(messages, null, 2)}`
      ).toBe(true);
    });
  }

  it('loading page shows loading UI messages during suspense', async ({
    page
  }) => {
    await page.goto('/');
    await page.locator('a[href="/loading"]').first().click();
    await page.waitForSelector('text=Loading page …', {timeout: 5000});
    const messages = await readProviderClientMessages(page);
    const loadingExpected = {o6jHkb: 'Loading page …'};
    const hasMatch = messages.some((m) =>
      providerMatchesExactly(m, loadingExpected)
    );
    expect(
      hasMatch,
      'Expected provider with loading UI messages (o6jHkb)'
    ).toBe(true);
    await page.waitForSelector('text=Static page', {timeout: 5000});
  });

  it('has matching messages for soft navigation of /feed -> /photo/alpha', async ({
    page
  }) => {
    await page.goto('/feed');
    await page.locator('a[href="/photo/alpha"]').first().click();
    await expect(page).toHaveURL('/photo/alpha');

    const messages = await readProviderClientMessages(page);
    const photoExpected = {Ax7uMP: ['Intercepted photo modal: ', ['id']]};
    const hasPhoto = messages.some((m) =>
      providerMatchesExactly(m, photoExpected)
    );
    expect(hasPhoto).toBe(true);
  });
});

const HMR_ORIGINAL_CONTENT = `'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function HmrTestContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('HMR test initial')}</p>
    </ClientBoundary>
  );
}
`;

describe.serial('HMR message updates', () => {
  const HMR_RECOMPILE_WAIT_MS = 5000;

  it.afterEach(() => {
    writeFileSync(HMR_TEST_CONTENT_PATH, HMR_ORIGINAL_CONTENT);
  });

  it('updates rendered messages when modifying client message', async ({
    page
  }) => {
    await page.goto('/hmr-test');
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(true);

    writeFileSync(
      HMR_TEST_CONTENT_PATH,
      HMR_ORIGINAL_CONTENT.replace("'HMR test initial'", "'HMR test modified'")
    );
    await page.waitForTimeout(HMR_RECOMPILE_WAIT_MS);
    await page.reload();

    messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test modified')).toBe(true);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(false);
  });

  it('updates rendered messages when adding client message', async ({
    page
  }) => {
    await page.goto('/hmr-test');
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(true);

    writeFileSync(
      HMR_TEST_CONTENT_PATH,
      `'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function HmrTestContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('HMR test initial')}</p>
      <p>{t('HMR test added')}</p>
    </ClientBoundary>
  );
}
`
    );
    await page.waitForTimeout(HMR_RECOMPILE_WAIT_MS);
    await page.reload();

    messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(true);
    expect(messagesContainValue(messages, 'HMR test added')).toBe(true);
  });

  it('updates rendered messages when deleting client message', async ({
    page
  }) => {
    await page.goto('/hmr-test');
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(true);

    writeFileSync(
      HMR_TEST_CONTENT_PATH,
      `'use client';

import ClientBoundary from '@/components/ClientBoundary';

export default function HmrTestContent() {
  return (
    <ClientBoundary>
      <p>Static content only</p>
    </ClientBoundary>
  );
}
`
    );
    await page.waitForTimeout(HMR_RECOMPILE_WAIT_MS);
    await page.reload();

    messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'HMR test initial')).toBe(false);
  });
});
