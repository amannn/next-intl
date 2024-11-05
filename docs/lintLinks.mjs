import glob from 'fast-glob';
import {printErrors, scanURLs, validateFiles} from 'next-validate-link';

const scanned = await scanURLs();

printErrors(
  await validateFiles(await glob('src/pages/docs/**/*.{md,mdx}'), {
    scanned
  }),
  true
);
