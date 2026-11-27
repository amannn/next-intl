import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {withTempEdit} from 'e2e-utils/temp-files';
import {createJsonCatalogUtils} from './catalog-utils.js';

const APP_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {expectCatalog, expectCatalogPredicate} = createJsonCatalogUtils(
  path.join(APP_ROOT, 'messages')
);

it('renders MDX content, rich text and metadata in two locales', async ({
  page,
  context,
  baseURL
}) => {
  await page.goto('/mdx');
  await expect(page).toHaveTitle('MDX title');
  await expect(page.getByRole('heading', {name: 'MDX heading'})).toBeVisible();
  await expect(page.locator('strong')).toHaveText('documentation');

  await context.addCookies([{name: 'locale', value: 'de', url: baseURL!}]);
  await page.reload();
  await expect(page).toHaveTitle('MDX-Titel');
  await expect(
    page.getByRole('heading', {name: 'MDX-Überschrift'})
  ).toBeVisible();
  await expect(page.locator('strong')).toHaveText('Dokumentation');
  await expect(page.getByText('This text is not translated.')).toBeVisible();
});

it('updates MDX content and catalogs during development', async ({page}) => {
  await page.goto('/mdx');
  {
    await using _ = await withTempEdit(
      APP_ROOT,
      'src/app/mdx/page.mdx',
      (await fs.readFile(path.join(APP_ROOT, 'src/app/mdx/page.mdx'), 'utf8')) +
        "\n\n## {t({id: 'mdxChanged', message: 'Changed MDX'})}"
    );
    await expectCatalog('en.json', {mdxChanged: 'Changed MDX'});
    await expectCatalog('de.json', {mdxChanged: ''});
    await expect(
      page.getByRole('heading', {name: 'Changed MDX'})
    ).toBeVisible();
  }
  await expectCatalogPredicate(
    'en.json',
    (catalog) => !('mdxChanged' in catalog)
  );
  await expectCatalogPredicate(
    'de.json',
    (catalog) => !('mdxChanged' in catalog)
  );
});
