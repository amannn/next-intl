import {getPresets} from 'eslint-config-molindo';
import globals from 'globals';

export default (await getPresets('typescript', 'react', 'jest')).concat({
  languageOptions: {
    globals: globals.node
  }
});
