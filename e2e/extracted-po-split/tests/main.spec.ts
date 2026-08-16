import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {createPoCatalogUtils, getPoEntry} from './catalog-utils.js';
import {withTempEdit} from 'e2e-utils/temp-files';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectCatalog} = createPoCatalogUtils(MESSAGES_DIR);
const withTempEditApp = (filePath: string, content: string) =>
  withTempEdit(APP_ROOT, filePath, content);

it('renders messages from the root catalog and a namespace catalog', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Hello'})).toBeVisible();
  await expect(page.getByText('Hey!')).toBeVisible();
});

it('writes unnamespaced messages to the root catalog', async ({page}) => {
  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (catalog) => getPoEntry(catalog, 'NhX4DJ') != null
  );
  expect(getPoEntry(content, 'NhX4DJ')).toMatch(/msgstr "Hello"/);
  expect(content).not.toContain('msgctxt "ui"');
});

it('writes namespaced messages to a namespace catalog', async ({page}) => {
  await page.goto('/');
  const content = await expectCatalog(
    'ui/en.po',
    (catalog) => getPoEntry(catalog, '-YJVTi') != null
  );
  expect(content).toMatch(/msgctxt "ui"\s+msgid "-YJVTi"\s+msgstr "Hey!"/);
});

it('extracts new namespaced messages into the namespace catalog', async ({
  page
}) => {
  await using _ = await withTempEditApp(
    'src/components/Greeting.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted('ui');
  return <div>{t('Hey!')}{t('Newly extracted')}</div>;
}
`
  );

  await page.goto('/');
  const content = await expectCatalog('ui/en.po', (catalog) =>
    catalog.includes('Newly extracted')
  );
  expect(content).toContain('Newly extracted');
  expect(content).toContain('msgctxt "ui"');

  const root = await expectCatalog(
    'en.po',
    (catalog) => getPoEntry(catalog, 'NhX4DJ') != null
  );
  expect(root).not.toContain('Newly extracted');
});
