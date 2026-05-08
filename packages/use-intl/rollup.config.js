import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    core: 'src/core.tsx',
    react: 'src/react.tsx',
    'format-message/index': 'src/core/format-message/index.tsx',
    'format-message/format-only': 'src/core/format-message/format-only.tsx'
  },
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    'react/jsx-runtime',
    'use-intl/format-message',
    'use-intl/format-message/format-only'
  ]
});
