import fs from 'fs';
import path from 'path';
import {expect, it} from 'vitest';

const projectRoot = path.resolve(import.meta.dirname, '..');
const messagesPath = path.join(projectRoot, 'messages', 'en.json');

it('extracts messages during build', () => {
  const content = fs.readFileSync(messagesPath, 'utf-8');
  const messages = JSON.parse(content) as Record<string, string>;
  const values = Object.values(messages);

  expect(values).toContain('Hello world');
  expect(values).toContain('Count: {count, number}');
  expect(values).toContain('Layout header');
  const ui = (messages as Record<string, unknown>).ui as
    | Record<string, string>
    | undefined;
  expect(ui).toBeDefined();
  expect(Object.values(ui ?? {})).toContain('Submit');
});
