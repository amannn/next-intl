import {createRequire} from 'module';

export default function loadDependencyTree(): any {
  try {
    const require = createRequire(import.meta.url);
    return require('dependency-tree');
  } catch {
    return null;
  }
}
