import {createRequire} from 'module';
import {transform} from '@swc/core';
import {expect, it} from 'vitest';

const require = createRequire(import.meta.url);

/**
 * Runs the SWC plugin directly and returns its raw `results` output, before
 * any mapping by `MessageExtractor`. This exercises the full plugin output,
 * including fields that the catalog pipeline strips (e.g. `ranges`).
 */
async function extractRaw(code: string) {
  const filePath = 'test.tsx';
  const result = await transform(code, {
    jsc: {
      target: 'esnext',
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true
      },
      experimental: {
        cacheRoot: 'node_modules/.cache/swc',
        disableBuiltinTransformsForInternalTesting: true,
        disableAllLints: true,
        plugins: [
          [
            require.resolve('next-intl-swc-plugin-extractor'),
            {isDevelopment: true, filePath}
          ]
        ]
      }
    },
    sourceFileName: filePath,
    filename: filePath
  });

  return JSON.parse(JSON.parse((result as any).output).results) as Array<any>;
}

it('emits source ranges for extracted messages', async () => {
  const source = `import {useExtracted, useTranslations} from 'next-intl';

function Component() {
  const t = useExtracted();
  const u = useTranslations();
  t('Hello!');
  t({message: 'Save', description: 'Button label'});
  u('external.key');
}
`;
  const results = await extractRaw(source);

  const extracted = results.filter((item) => item.type === 'extracted');
  const translations = results.filter((item) => item.type === 'translation');
  expect(extracted).toHaveLength(2);
  expect(translations).toHaveLength(1);

  const [stringForm, objectForm] = extracted;

  // In string form, the argument is the message literal itself
  expect(stringForm.ranges.argument).toEqual({start: 144, end: 152});
  expect(stringForm.ranges.message).toEqual(stringForm.ranges.argument);
  expect(stringForm.ranges.description).toBeUndefined();
  expect(stringForm.ranges.id).toBeUndefined();
  expect(source.slice(144, 152)).toBe("'Hello!'");

  // In object form, `message` and `description` point at the value literals
  expect(objectForm.ranges.argument).toEqual({start: 159, end: 205});
  expect(objectForm.ranges.message).toEqual({start: 169, end: 175});
  expect(objectForm.ranges.description).toEqual({start: 190, end: 204});
  expect(objectForm.ranges.id).toBeUndefined();
  expect(source.slice(169, 175)).toBe("'Save'");
  expect(source.slice(190, 204)).toBe("'Button label'");

  // `useTranslations` usages carry no ranges
  expect(translations[0].ranges).toBeUndefined();
});
