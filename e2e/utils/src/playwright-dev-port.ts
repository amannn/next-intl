import getPort from 'get-port';

/**
 * Resolve one TCP port for Playwright `webServer.port` and `use.baseURL`.
 *
 * Playwright evaluates `playwright.config.ts` in separate Node processes (runner vs workers).
 * Plain `await getPort()` runs again in each process and yields different ports — the browser
 * then hits one port while Next listens on another. Workers cannot share in-memory variables,
 * but they inherit `process.env`, so the first evaluation reserves a port and persists it here;
 * later loads read the same value instead of allocating again.
 *
 * Still use `workers: 1`: parallel workers would each spawn their own webServer anyway.
 */
export async function reserveSharedPlaywrightDevPort(envVarKey: string): Promise<number> {
  const persisted = process.env[envVarKey];

  if (persisted !== undefined && persisted !== '') {
    const port = Number(persisted);
    if (!Number.isInteger(port)) {
      throw new Error(`Invalid ${envVarKey}: "${persisted}"`);
    }
    return port;
  }

  const port = await getPort({reserve: true});
  process.env[envVarKey] = String(port);
  return port;
}
