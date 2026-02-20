import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {createExtractionHelpers} from '../../extracted-json/tests/helpers.js';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectJson} = createExtractionHelpers(MESSAGES_DIR);

describe('srcPath includes node_modules when explicitly requested', () => {
  it('includes node_modules if explicitly requested', async ({page}) => {
    await page.goto('/');
    const en = await expectJson('en.json', {'Cq+Nds': 'Profile card'});
    expect(en['Cq+Nds']).toBe('Profile card');
  });
});
