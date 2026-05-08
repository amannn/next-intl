import fs from 'fs/promises';
import path from 'path';

export async function withTempEdit(
  appRoot: string,
  filePath: string,
  newContent: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.writeFile(fullPath, newContent);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

export async function withTempFile(
  appRoot: string,
  filePath: string,
  content: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  let existed = true;
  let original = '';
  try {
    original = await fs.readFile(fullPath, 'utf-8');
  } catch {
    existed = false;
  }
  await fs.writeFile(fullPath, content);
  return {
    [Symbol.asyncDispose]: async () => {
      if (existed) {
        await fs.writeFile(fullPath, original);
      } else {
        await fs.unlink(fullPath);
      }
    }
  };
}

export async function withTempRemove(
  appRoot: string,
  filePath: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.unlink(fullPath);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}
