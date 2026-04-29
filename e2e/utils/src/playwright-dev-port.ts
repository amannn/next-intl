import getPort from 'get-port';

/**
 * Resolve one TCP port for Playwright `webServer.port` and `use.baseURL`.
 *
 * Playwright evaluates `playwright.config.ts` in separate processes (`fork`). A fresh `getPort()` in
 * each process yields different ports → `baseURL` and the dev server disagree (`ERR_CONNECTION_REFUSED`).
 *
 * `process.env` is shared across `fork`'d children of the Playwright CLI, so persist the reservation
 * in a runner-only-visible key for the remainder of that invocation (no leftover file across runs).
 */
export async function reserveSharedPlaywrightDevPort(envVarKey: string): Promise<number> {
  const persisted = process.env[envVarKey];

  if (persisted !== undefined && persisted !== '') {
    const already = Number(persisted);
    if (!Number.isInteger(already)) {
      throw new Error(`Invalid ${envVarKey}: "${persisted}"`);
    }
    return already;
  }

  const port = await getPort({reserve: true});
  process.env[envVarKey] = String(port);
  return port;
}
