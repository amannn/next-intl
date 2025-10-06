import path from 'path';

const cwd = process.cwd();

// This loader runs at build time for all possible values

/**
 * Parses and optimizes catalog files.
 *
 * Note that if we use a dynamic import like `import(`${locale}.json`)`, then
 * the loader will optimistically run for all candidates in this folder (both
 * during dev as well as at build time).
 */
export default function catalogLoader(source) {
  const options = this.getOptions();

  // Check if file is within `messagesPath`.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  const messagesPath = path.join(cwd, options.messagesPath);
  const isWithinMessagesPath = !path
    .relative(messagesPath, this.resourcePath)
    .startsWith('..');
  if (!isWithinMessagesPath) return source;

  // TODO: JSON.parse trick? Check if this makes a difference.
  // Since we have the condition above, maybe we shouldn't
  // return JS since this could break other .json imports.
  // But in Next.js 16 with `conditions`, this might work.
  return `export default ${source};`;
}
