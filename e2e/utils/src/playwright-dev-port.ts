import getPort from 'get-port';

const KEY = 'E2E_PLAYWRIGHT_DEV_PORT';

/**
 * Ensures Playwright runners and subprocess workers reuse the same free port when the config
 * file is evaluated multiple times: first call allocates and stores in env; subsequent calls read it.
 */
export async function getOrReservePlaywrightDevPort(): Promise<number> {
  const inherited = process.env[KEY];
  if (inherited !== undefined && inherited !== '') {
    const parsed = Number(inherited);
    if (!Number.isInteger(parsed)) {
      throw new Error(`Invalid ${KEY}: ${inherited}`);
    }
    return parsed;
  }

  const port = await getPort({reserve: true});
  process.env[KEY] = String(port);
  return port;
}
