import {expect, test as it, type Page} from '@playwright/test';
import {writeFileSync} from 'fs';
import {join} from 'path';

const {describe} = it;

const COUNTER_PATH = join(process.cwd(), 'src/app/Counter.tsx');

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

const COUNTER_ORIGINAL = `'use client';

import {useExtracted} from 'next-intl';
import {useState} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

export default function Counter() {
  const [count, setCount] = useState(1000);
  const t = useExtracted();

  function onIncrement() {
    setCount(count + 1);
  }

  return (
    <ClientBoundary>
      <p>{t('Count: {count, number}', {count})}</p>
      <button
        className="border border-gray-300 rounded-md px-2 py-1"
        onClick={onIncrement}
      >
        {t('Increment')}
      </button>
    </ClientBoundary>
  );
}
`;

describe.serial('HMR message updates', () => {
  const HMR_POLL_TIMEOUT_MS = 15_000;

  it.afterEach(() => {
    writeFileSync(COUNTER_PATH, COUNTER_ORIGINAL);
  });

  it('updates rendered messages when modifying client message', async ({
    page
  }) => {
    await page.goto('/');
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'Increment')).toBe(true);

    writeFileSync(
      COUNTER_PATH,
      COUNTER_ORIGINAL.replace("'Increment'", "'Increment plus'")
    );

    await expect
      .poll(
        async () => {
          const m = await readProviderClientMessages(page);
          return (
            messagesContainValue(m, 'Increment plus') &&
            !messagesContainValue(m, 'Increment')
          );
        },
        {timeout: HMR_POLL_TIMEOUT_MS}
      )
      .toBe(true);
  });

  it('updates rendered messages when adding client message', async ({
    page
  }) => {
    await page.goto('/');
    await page.reload(); // Reset after previous test's restore (messages come from server)
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'Increment')).toBe(true);

    writeFileSync(
      COUNTER_PATH,
      COUNTER_ORIGINAL.replace(
        '</button>\n    </ClientBoundary>',
        '</button>\n      <span>{t(\'Decrement\')}</span>\n    </ClientBoundary>'
      )
    );

    await expect
      .poll(
        async () => {
          const m = await readProviderClientMessages(page);
          return (
            messagesContainValue(m, 'Increment') &&
            messagesContainValue(m, 'Decrement')
          );
        },
        {timeout: HMR_POLL_TIMEOUT_MS}
      )
      .toBe(true);
  });

  it('updates rendered messages when deleting client message', async ({
    page
  }) => {
    await page.goto('/');
    await page.reload(); // Reset after previous test's restore (messages come from server)
    let messages = await readProviderClientMessages(page);
    expect(messagesContainValue(messages, 'Increment')).toBe(true);

    writeFileSync(
      COUNTER_PATH,
      COUNTER_ORIGINAL.replace("{t('Increment')}", "'Click'")
    );

    await expect
      .poll(
        async () => {
          const m = await readProviderClientMessages(page);
          return !messagesContainValue(m, 'Increment');
        },
        {timeout: HMR_POLL_TIMEOUT_MS}
      )
      .toBe(true);
  });
});
