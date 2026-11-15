import {test} from 'vite-plus/test';
import MessageExtractor from './MessageExtractor.js';

const testCode = `
  import {useExtracted} from 'next-intl';

  function Component() {
    const t = useExtracted();
    t("Hello, {name}!", {name: 'Alice'});
    t("Welcome!");
    t.rich("Hello <b>World</b>!", {b: (chunks) => <b>{chunks}</b>});
    t.markup("Click <a>here</a>", {a: (chunks) => \`<a>\${chunks}</a>\`});
    t.has("Test message");
  }

  function AnotherComponent() {
    const t = useExtracted('ui');
    t("Button label");
    t("Submit");
  }
`;

function createExtractor(sourceMap: boolean) {
  return new MessageExtractor({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap
  });
}

test('extract messages', async ({bench}) => {
  await bench.compare(
    bench('without source maps', async () => {
      await createExtractor(false).extract('/project/test.tsx', testCode);
    }),
    bench('with source maps', async () => {
      await createExtractor(true).extract('/project/test.tsx', testCode);
    })
  );
});
