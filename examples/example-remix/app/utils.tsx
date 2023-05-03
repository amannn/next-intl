import fs from 'fs/promises';
import path from 'path';
import acceptLanguageParser from 'accept-language-parser';

export function resolveLocale(request: Request) {
  const supportedLanguages = ['en', 'de'];
  const defaultLangauge = supportedLanguages[0];
  const locale =
    acceptLanguageParser.pick(
      supportedLanguages,
      request.headers.get('accept-language') || defaultLangauge
    ) || defaultLangauge;

  return locale;
}

export async function getMessages(locale: string) {
  const messagesPath = path.join(process.cwd(), `./messages/${locale}.json`);
  const content = await fs.readFile(messagesPath, 'utf-8');
  return JSON.parse(content);
}
