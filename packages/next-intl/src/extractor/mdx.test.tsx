// @vitest-environment node
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {afterEach, expect, it, vi} from 'vitest';
import {unstable_extractMessages} from '../extractor.js';
import getNextConfig from '../plugin/getNextConfig.js';
import normalizeExtractorConfig from './normalizeExtractorConfig.js';
import type * as ExtractorUtils from './utils.js';

let projectRoot: string;

vi.mock('./utils.js', async (importOriginal) => ({
  ...(await importOriginal<typeof ExtractorUtils>()),
  getDefaultProjectRoot: () => projectRoot
}));

afterEach(async () => {
  if (projectRoot) await fs.rm(projectRoot, {recursive: true, force: true});
});

const messages = {
  format: 'json',
  path: './messages',
  locales: ['en', 'de'],
  sourceLocale: 'en'
} as const;

it('extracts MDX through the public manual API', async () => {
  projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'next-intl-mdx-'));
  await fs.mkdir(path.join(projectRoot, 'src'));
  await fs.writeFile(path.join(projectRoot, 'src/page.mdx'), "# {t('Hello!')}");
  await unstable_extractMessages({
    srcPath: './src',
    messages,
    extract: {mdx: true}
  });
  expect(
    JSON.parse(
      await fs.readFile(path.join(projectRoot, 'messages/en.json'), 'utf8')
    )
  ).toEqual({OpKKos: 'Hello!'});
  expect(
    JSON.parse(
      await fs.readFile(path.join(projectRoot, 'messages/de.json'), 'utf8')
    )
  ).toEqual({OpKKos: ''});
});

it('keeps MDX disabled unless requested', () => {
  expect(
    normalizeExtractorConfig({srcPath: './src', messages, extract: true})
      .extract.mdx
  ).toBeUndefined();
  expect(
    normalizeExtractorConfig({
      srcPath: './src',
      messages,
      extract: {mdx: false}
    }).extract.mdx
  ).toBe(false);
});

it('rejects the Rust MDX compiler when MDX extraction is enabled', () => {
  expect(() =>
    getNextConfig(
      {experimental: {extract: {mdx: true}}},
      {experimental: {mdxRs: true}}
    )
  ).toThrow('mdxRs');
});
