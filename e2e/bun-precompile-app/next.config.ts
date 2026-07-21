import {NextConfig} from 'next';
// Note: `next-intl/plugin` is used indirectly through a workspace package
// (`e2e-bun-precompile-config`), mirroring a common monorepo setup. See
// `test.mjs` for the regression this reproduces.
import {withI18n} from 'e2e-bun-precompile-config/plugin';

const config: NextConfig = {};

export default withI18n(config);
