import getRequestConfig from './getRequestConfig';
import fs from 'fs';
import path from 'path';

describe('getRequestConfig runtime fallback', () => {
  it('uses requestLocale when createRequestConfig returns no locale', async () => {
    const confFactory = getRequestConfig(async ({requestLocale}) => ({messages: {}} as any));
    const cfg = await confFactory({requestLocale: Promise.resolve('en') as any});
    expect(cfg.locale).toBe('en');
  });

  it('uses next-intl.config defaultLocale when no locale available', async () => {
    const cfgPath = path.join(process.cwd(), 'next-intl.config.cjs');
    fs.writeFileSync(cfgPath, "module.exports = { defaultLocale: 'fr' }\n");
    try {
      const confFactory = getRequestConfig(async () => ({messages: {}} as any));
      const cfg = await confFactory({requestLocale: Promise.resolve(undefined) as any});
      expect(cfg.locale).toBe('fr');
    } finally {
      try { fs.unlinkSync(cfgPath); } catch (e) {}
    }
  });
});
