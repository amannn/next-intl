import {getPresets} from 'eslint-config-molindo';
import globals from 'globals';

export default (await getPresets('typescript', 'react', 'tailwind')).concat({
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node
    }
  }
});
