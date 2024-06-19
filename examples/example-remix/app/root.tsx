import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import {ReactNode} from 'react';
import {IntlProvider} from 'use-intl';
import {getMessages, resolveLocale} from './utils';

export async function loader({request}: {request: Request}) {
  const locale = resolveLocale(request);

  return {
    locale,
    messages: await getMessages(locale),
    timeZone: 'Europe/Vienna'
  };
}

export function Layout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const {locale, messages, timeZone} = useLoaderData<typeof loader>();

  return (
    <IntlProvider locale={locale} messages={messages} timeZone={timeZone}>
      <Outlet />
    </IntlProvider>
  );
}
