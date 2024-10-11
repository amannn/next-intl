import {execSync} from 'child_process';

const useCases = [
  'main',
  'locale-prefix-never',
  'trailing-slash',
  'base-path',
  'domains',
  'locale-cookie-false'
];

for (const useCase of useCases) {
  // eslint-disable-next-line no-console
  console.log(`Running tests for use case: ${useCase}`);

  const command = `NEXT_PUBLIC_USE_CASE=${useCase} pnpm build && NEXT_PUBLIC_USE_CASE=${useCase} TEST_MATCH=${useCase}.spec.ts playwright test`;
  execSync(command, {stdio: 'inherit'});
}
