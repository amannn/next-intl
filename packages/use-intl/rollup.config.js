import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    core: 'src/core.tsx',
    react: 'src/react.tsx',
    'format-message/index': 'src/core/formatMessage/index.tsx',
    'format-message/compileAndFormat': 'src/core/formatMessage/compileAndFormat.tsx',
    'format-message/formatOnly': 'src/core/formatMessage/formatOnly.tsx'
  },
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    'react/jsx-runtime'
  ]
});
