// Avoid rollup's `replace` plugin to compile this away
const nodeEnvKey = 'NODE_ENV'.trim();

// We avoid reading `argv.includes('dev')` related to
// https://github.com/amannn/next-intl/issues/2006
export const isDevelopment = process.env[nodeEnvKey] === 'development';

export const isNextBuild = process.argv.includes('build');
export const isDevelopmentOrNextBuild = isDevelopment || isNextBuild;
