import {getBuildConfig} from 'tools';
import pkg from './package.json' with {type: 'json'};

export default getBuildConfig({
  input: {
    compile: 'src/compile.tsx',
    format: 'src/format.tsx'
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
});
