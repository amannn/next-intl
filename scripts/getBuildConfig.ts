import fs from 'fs';
import {Options} from 'tsup';

const envs = ['development', 'production'];

export const outDir = './dist/';

// maybe separate react-server build? but this sucks somewhat

function getEnvBuildConfig({env, entry, ...rest}): Options {
  return {
    entry,
    outDir: './dist/' + env,
    format: ['cjs'],
    clean: true,
    treeshake: 'smallest',
    splitting: true,
    minify: env !== 'development',
    dts: env !== 'development',
    esbuildOptions(options) {
      options.outbase = './';
      options.define = {
        ...options.define,
        'process.env.NODE_ENV': JSON.stringify(env)
      };
    },
    async onSuccess() {
      if (env !== 'production') return;

      Object.entries(entry).forEach(([key, value]) => {
        fs.writeFileSync(
          `./${outDir}/${key}.js`,
          `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./production/${key}.js');
} else {
  module.exports = require('./development/${key}.js');
}
`
        );
      });
    },
    ...rest
  };
}

export default function getBuildConfig({entry, ...rest}): Options[] {
  return envs.map((env) =>
    getEnvBuildConfig({
      env,
      entry,
      ...rest
    })
  );
}
