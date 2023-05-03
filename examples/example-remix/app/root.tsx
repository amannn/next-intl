import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import {IntlProvider} from 'use-intl';
import {getMessages, resolveLocale} from './utils';

export function meta() {
  return {title: 'example-remix'};
}

export async function loader({request}: {request: Request}) {
  const locale = resolveLocale(request);

  return {
    locale,
    messages: await getMessages(locale)
  };
}

export default function App() {
  const {locale, messages} = useLoaderData();

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        <IntlProvider locale={locale} messages={messages}>
          <Outlet />
        </IntlProvider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}
