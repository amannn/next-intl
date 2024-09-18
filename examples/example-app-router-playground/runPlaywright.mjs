import {execSync} from 'child_process';

const useCases = ['main', 'locale-prefix-never', 'trailing-slash', 'base-path'];

for (const useCase of useCases) {
  // eslint-disable-next-line no-console
  console.log(`Running tests for use case: ${useCase}`);

  const command = `USE_CASE=${useCase} pnpm build && USE_CASE=${useCase} TEST_MATCH=${useCase}.spec.ts playwright test`;
  execSync(command, {stdio: 'inherit'});
}
