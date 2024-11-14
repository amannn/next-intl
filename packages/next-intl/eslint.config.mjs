import {getPresets} from 'eslint-config-molindo';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default (await getPresets('typescript', 'react', 'vitest')).concat({
  plugins: {
    'react-compiler': reactCompilerPlugin
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            // Because:
            // - Avoid hardcoding the `locale` param
            // - Prepare for a new API in Next.js to read params deeply
            // - Avoid issues with `dynamicIO`
            name: 'next/navigation.js',
            importNames: ['useParams']
          }
        ]
      }
    ]
  }
});
