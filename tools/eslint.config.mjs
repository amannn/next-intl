import {getPresets} from 'eslint-config-molindo';
import globals from 'globals';

export default (await getPresets('javascript')).concat({
  languageOptions: {
    globals: globals.node
  }
});
