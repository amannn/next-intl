import glob from 'fast-glob';
import {printErrors, scanURLs, validateFiles} from 'next-validate-link';

const scanned = await scanURLs();

// {
//   urls: Map(12) {
//     '/_app' => {},
//     '/_document' => {},
//     '/_meta' => {},
//     '/api/og-image' => {},
//     '/blog/_meta' => {},
//     '/docs/_meta' => {},
//     '/docs/environments/_meta' => {},
//     '/docs/getting-started/_meta' => {},
//     '/docs/routing/_meta' => {},
//     '/docs/usage/_meta' => {},
//     '/docs/workflows/_meta' => {},
//     '/docs/getting-started/app-router/_meta' => {}
//   },
//   fallbackUrls: []
// }
console.log(scanned);

printErrors(
  await validateFiles(await glob('src/pages/docs/**/*.{md,mdx}'), {
    scanned
  }),
  true
);
