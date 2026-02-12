import {createHash} from 'node:crypto';
import {readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {expect, test as it, type Page} from '@playwright/test';

const RUN_HMR_TESTS = process.env.NEXT_INTL_E2E_DEV_HMR === '1';
const describeHmr = RUN_HMR_TESTS ? it.describe : it.describe.skip;
const FEED_PAGE_PATH = join(process.cwd(), 'src', 'app', 'feed', 'page.tsx');
const FEED_INTERCEPTED_MODAL_PAGE_PATH = join(
  process.cwd(),
  'src',
  'app',
  'feed',
  '@modal',
  '(..)photo',
  '[id]',
  'page.tsx'
);
const HMR_COMPONENT_PATH = join(
  process.cwd(),
  'src',
  'app',
  'feed',
  'HmrImportComponent.tsx'
);
const EXTRACTED_MESSAGES_PATH = join(process.cwd(), 'messages', 'en.po');
const MANIFEST_PATH = join(
  process.cwd(),
  'node_modules',
  '.cache',
  'next-intl',
  'client-manifest.json'
);
let originalExtractedMessagesSource: string | undefined;
const FEED_PAGE_ORIGINAL_SOURCE =
  [
    "'use client';",
    '',
    "import {useExtracted} from 'next-intl';",
    "import ClientBoundary from '@/components/ClientBoundary';",
    '',
    'export default function FeedPage() {',
    '  const t = useExtracted();',
    '  return (',
    '    <ClientBoundary>',
    "      <p>{t('Feed page')}</p>",
    '    </ClientBoundary>',
    '  );',
    '}'
  ].join('\n') + '\n';
const INTERCEPTED_MODAL_PAGE_ORIGINAL_SOURCE =
  [
    "'use client';",
    '',
    "import {use} from 'react';",
    "import {useExtracted} from 'next-intl';",
    "import ClientBoundary from '@/components/ClientBoundary';",
    '',
    "export default function FeedPhotoModalPage({params}: PageProps<'/photo/[id]'>) {",
    '  const {id} = use(params);',
    '  const t = useExtracted();',
    '',
    '  return (',
    '    <ClientBoundary>',
    "      <p>{t('Intercepted photo modal: {id}', {id})}</p>",
    '    </ClientBoundary>',
    '  );',
    '}'
  ].join('\n') + '\n';
const FEED_PAGE_WITH_HMR_IMPORT_SOURCE =
  [
    "'use client';",
    '',
    "import {useExtracted} from 'next-intl';",
    "import ClientBoundary from '@/components/ClientBoundary';",
    "import HmrImportComponent from './HmrImportComponent';",
    '',
    'export default function FeedPage() {',
    '  const t = useExtracted();',
    '  return (',
    '    <ClientBoundary>',
    "      <p>{t('Feed page')}</p>",
    '      <HmrImportComponent />',
    '    </ClientBoundary>',
    '  );',
    '}'
  ].join('\n') + '\n';
const HMR_COMPONENT_SOURCE =
  [
    "'use client';",
    '',
    "import {useExtracted} from 'next-intl';",
    '',
    'export default function HmrImportComponent() {',
    '  const t = useExtracted();',
    "  return <p>{t('HMR import component')}</p>;",
    '}'
  ].join('\n') + '\n';
const INTERCEPTED_MODAL_PAGE_WITH_HMR_SOURCE =
  [
    "'use client';",
    '',
    "import {use} from 'react';",
    "import {useExtracted} from 'next-intl';",
    "import ClientBoundary from '@/components/ClientBoundary';",
    '',
    "export default function FeedPhotoModalPage({params}: PageProps<'/photo/[id]'>) {",
    '  const {id} = use(params);',
    '  const t = useExtracted();',
    '',
    '  return (',
    '    <ClientBoundary>',
    "      <p>{t('Intercepted photo modal HMR: {id}', {id})}</p>",
    '    </ClientBoundary>',
    '  );',
    '}'
  ].join('\n') + '\n';

function getExtractedKey(message: string): string {
  return createHash('sha512').update(message).digest('base64').slice(0, 6);
}

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

async function restoreFixtureFiles() {
  await writeFile(FEED_PAGE_PATH, FEED_PAGE_ORIGINAL_SOURCE, 'utf8');
  await writeFile(
    FEED_INTERCEPTED_MODAL_PAGE_PATH,
    INTERCEPTED_MODAL_PAGE_ORIGINAL_SOURCE,
    'utf8'
  );
  await rm(HMR_COMPONENT_PATH, {force: true});
  if (originalExtractedMessagesSource != null) {
    await writeFile(
      EXTRACTED_MESSAGES_PATH,
      originalExtractedMessagesSource,
      'utf8'
    );
  }
}

async function waitForFallbackManifest() {
  await expect
    .poll(
      async () => {
        try {
          const source = await readFile(MANIFEST_PATH, 'utf8');
          const manifest = JSON.parse(source) as Record<string, unknown>;
          return (
            manifest['/feed'] != null && manifest['/use-translations'] != null
          );
        } catch {
          return false;
        }
      },
      {timeout: 30_000}
    )
    .toBe(true);
}

describeHmr('tree-shaking dev HMR', () => {
  it.describe.configure({mode: 'serial'});

  it.beforeAll(async () => {
    originalExtractedMessagesSource = await readFile(
      EXTRACTED_MESSAGES_PATH,
      'utf8'
    );
  });

  it.afterEach(async () => {
    await restoreFixtureFiles();
  });

  it('updates inferred messages when editing a client dependency', async ({
    page
  }) => {
    const newFeedMessage = 'Feed page HMR update';
    const newFeedKey = getExtractedKey(newFeedMessage);

    await waitForFallbackManifest();
    await page.goto('/feed');
    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          const providerMessages = messages[0];
          return (
            providerMessages['I6Uu2z'] === 'Feed page' &&
            providerMessages['Z2Vmmr'] === 'Feed modal default'
          );
        },
        {timeout: 30_000}
      )
      .toBe(true);

    await writeFile(
      FEED_PAGE_PATH,
      FEED_PAGE_ORIGINAL_SOURCE.replace(
        "      <p>{t('Feed page')}</p>",
        `      <p>{t('${newFeedMessage}')}</p>`
      ),
      'utf8'
    );

    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          const providerMessages = messages[0];
          return (
            providerMessages[newFeedKey] === newFeedMessage &&
            providerMessages['I6Uu2z'] === undefined &&
            providerMessages['Z2Vmmr'] === 'Feed modal default'
          );
        },
        {timeout: 30_000}
      )
      .toBe(true);
  });

  it('adds and removes inferred keys when imports change', async ({page}) => {
    const importMessage = 'HMR import component';
    const importMessageKey = getExtractedKey(importMessage);

    await waitForFallbackManifest();
    await page.goto('/feed');

    await writeFile(HMR_COMPONENT_PATH, HMR_COMPONENT_SOURCE, 'utf8');
    await writeFile(FEED_PAGE_PATH, FEED_PAGE_WITH_HMR_IMPORT_SOURCE, 'utf8');

    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          const providerMessages = messages[0];
          return providerMessages[importMessageKey] === importMessage;
        },
        {timeout: 30_000}
      )
      .toBe(true);

    await writeFile(FEED_PAGE_PATH, FEED_PAGE_ORIGINAL_SOURCE, 'utf8');
    await rm(HMR_COMPONENT_PATH, {force: true});

    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          const providerMessages = messages[0];
          return providerMessages[importMessageKey] === undefined;
        },
        {timeout: 30_000}
      )
      .toBe(true);
  });

  it('keeps nested layout ownership boundaries during HMR updates', async ({
    page
  }) => {
    const newModalMessage = 'Intercepted photo modal HMR: {id}';
    const newModalMessageKey = getExtractedKey(newModalMessage);

    await waitForFallbackManifest();
    await page.goto('/feed');
    await writeFile(
      FEED_INTERCEPTED_MODAL_PAGE_PATH,
      INTERCEPTED_MODAL_PAGE_WITH_HMR_SOURCE,
      'utf8'
    );

    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          const providerMessages = messages[0];
          return providerMessages[newModalMessageKey] === undefined;
        },
        {timeout: 30_000}
      )
      .toBe(true);

    await page.locator('a[href="/photo/alpha"]').first().click();
    await expect(page).toHaveURL('/photo/alpha');

    await expect
      .poll(
        async () => {
          const messages = await readProviderClientMessages(page);
          if (messages.length < 2) {
            return false;
          }

          const feedProviderMessages = messages[0];
          const interceptedProviderMessages = messages[1];

          return (
            feedProviderMessages[newModalMessageKey] === undefined &&
            interceptedProviderMessages['Ax7uMP'] === undefined &&
            Array.isArray(interceptedProviderMessages[newModalMessageKey])
          );
        },
        {timeout: 30_000}
      )
      .toBe(true);
  });
});
