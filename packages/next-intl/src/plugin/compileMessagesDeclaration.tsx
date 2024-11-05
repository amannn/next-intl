import fs from 'fs';
import path from 'path';
import {watch} from 'chokidar';
import {throwError} from './utils.tsx';

function runOnce(fn: () => void) {
  if (process.env._NEXT_INTL_COMPILE_MESSAGES === '1') {
    return;
  }
  process.env._NEXT_INTL_COMPILE_MESSAGES = '1';
  fn();
}

export default function compileMessagesDeclaration(messagesPath: string) {
  const fullPath = path.resolve(messagesPath);

  if (!fs.existsSync(fullPath)) {
    throwError(
      `\`compileMessagesDeclaration\` points to a non-existent file: ${fullPath}`
    );
  }
  if (!fullPath.endsWith('.json')) {
    throwError(
      `\`compileMessagesDeclaration\` needs to point to a JSON file. Received: ${fullPath}`
    );
  }

  const isDev = process.argv.includes('dev');
  const isBuild = process.argv.includes('build');

  if (!isDev && !isBuild) {
    return;
  }

  // Next.js can call the Next.js config multiple
  // times - ensure we only run once.
  runOnce(() => {
    compileDeclaration(messagesPath);

    if (isDev) {
      startWatching(messagesPath);
    }
  });
}

function startWatching(messagesPath: string) {
  const watcher = watch(messagesPath);

  watcher.on('change', () => {
    compileDeclaration(messagesPath, true);
  });

  process.on('exit', () => {
    void watcher.close();
  });
}

function compileDeclaration(messagesPath: string, async: true): Promise<void>;
function compileDeclaration(messagesPath: string, async?: false): void;
function compileDeclaration(
  messagesPath: string,
  async = false
): void | Promise<void> {
  const declarationPath = messagesPath.replace(/\.json$/, '.d.json.ts');

  function createDeclaration(content: string) {
    return `declare const messages: ${content.trim()};\n\nexport default messages;`;
  }

  if (async) {
    return fs.promises
      .readFile(messagesPath, 'utf-8')
      .then((content) =>
        fs.promises.writeFile(declarationPath, createDeclaration(content))
      );
  }

  const content = fs.readFileSync(messagesPath, 'utf-8');
  fs.writeFileSync(declarationPath, createDeclaration(content));
}
