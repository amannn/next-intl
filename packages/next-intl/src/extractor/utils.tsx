export function setNestedProperty(
  obj: Record<string, any>,
  keyPath: string,
  value: any
): void {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

export function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}
