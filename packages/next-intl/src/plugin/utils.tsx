function formatMessage(message: string) {
  return `\n[next-intl] ${message}\n`;
}

export function throwError(message: string): never {
  throw new Error(formatMessage(message));
}

export function warn(message: string) {
  console.warn(formatMessage(message));
}
