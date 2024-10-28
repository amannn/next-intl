import getBuildConfig from '../../scripts/getBuildConfig.mjs';
import pkg from './package.json' with {type: 'json'};

export default getBuildConfig({
  input: {
    index: 'src/index.tsx',
    core: 'src/core.tsx',
    react: 'src/react.tsx'
  },
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    'react/jsx-runtime'
  ]
});
