# Usage guide

## Structuring messages

The recommended approach is to group messages by components and embrace them as the primary unit of code organization in your app.

```js
// en.json
{
  "About": {
    "title": "About us"
  }
}
```

```js
// About.js
import {useTranslations} from 'next-intl';

function About() {
  const t = useTranslations('About');
  return <h1>{t('title')}</h1>;
}
```

You can provide more structure by nesting messages:

```js
// en.json
{
  "auth": {
    "SignUp": {
      "title": "Sign up",
      "form": {
        "placeholder": "Please enter your name",
        "submit": "Submit"
      }
    }
  }
}
```

```js
// SignUp.js
import {useTranslations} from 'next-intl';

function SignUp() {
  // Provide the lowest common denominator that contains
  // all messages this component needs to consume. 
  const t = useTranslations('auth.SignUp');

  return (
    <>
      <h1>{t('title')}</h1>
      <form>
        <input
          // The remaining hierarchy can be resolved by
          // using a dot to access nested messages.
          placeholder={t('form.placeholder')}
        />
        <button type="submit">{t('form.submit')}</button>
      </form>
    </>
  );
}
```

You don't have to group messages by components – use whatever suits your use case. You can theoretically use a common key for shared labels that are used frequently – however, based on experience it's often beneficial to duplicate labels across components, even if they are the same in one language. Depending on the context, a different label can be more appropriate (e.g. "not now" instead of "cancel"). Duplicating the labels allows to easily change them later on in case you want something more specific. Duplication on the network level is typically solved by gzip. In addition to this, you can achieve reuse by using shared components.

To retrieve all available messages in a component, you can omit the namespace path:

```js
const t = useTranslations();
```

## Providing messages

You can provide page-specific messages via [data fetching methods of Next.js](https://nextjs.org/docs/basic-features/data-fetching) for individual pages:

```js
// pages/index.js
export async function getStaticProps({locale}) {
  return {
    props: {
      // You can get the messages from anywhere you like, but the recommended
      // pattern is to put them in JSON files separated by language and read 
      // the desired one based on the `locale` received from Next.js. 
      messages: await import(`../../messages/index/${locale}.json`)
    }
  };
}
```

If you want to provide only the minimum amount of messages per page, you can filter your messages accordingly:

```js
// pages/index.js
import pick from 'lodash/pick';

const namespaces = ['Index'];

export async function getStaticProps({locale}) {
  return {
    props: {
      messages: pick(await import(`../../messages/index/${locale}.json`), namespaces)
    }
  };
}
```

Note that the `namespaces` can be a list that you generate dynamically based on used components. See the [example](../packages/example/src/pages/index.tsx).

## Rendering messages

```js
{
  "static": "Hello",
  "interpolation": "Hello {name}",

  // See https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format
  "plural": "You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.",
  
  // See https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
  "select": "{gender, select, male {He} female {She} other {They}} is online.",
  
  // See https://formatjs.io/docs/core-concepts/icu-syntax/#selectordinal-format
  "selectordinal": "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",

  // Messages can be used in attributes as well
  "attributeUrl": "https://example.com"
}
```

```js
t('static');
t('interpolation', {name: 'Jane'});
t('plural', {numMessages: 3});
t('selectordinal', {year: 11});
<a href={t('attributeUrl')}>Link</a>
```
## Rich text

You can format rich text with custom tags and map them to React components.

```js
{
  "richText": "This is <important><very>very</very> important</important>"
}
```

```js
t.rich('richText', {
  important: (children) => <b>{children}</b>,
  very: (children) => <i>{children}</i>
})
```

See the [FormatJS docs](https://formatjs.io/docs/core-concepts/icu-syntax/#rich-text-formatting) for syntax details.

## Raw messages

Messages are always parsed and therefore e.g. for rich text you need to supply the necessary tags. If you want to avoid the parsing, e.g. because you have raw HTML stored in a message, there's a separate API for this:

```js
{
  "content": "<h1>Headline<h1><p>This is raw HTML</p>"
}
```

```js
<div dangerouslySetInnerHTML={{__html: t.raw('content')}} />
```

**Important**: Note that you should sanitize content that you pass to `dangerouslySetInnerHTML` to avoid XSS attacks.

The value of a raw message can be any valid JSON value: strings, booleans, objects and arrays.

## Numbers

### `formatNumber`

When you're formatting plain numbers that are not part of a message, you can use a separate hook:

```js
import {useIntl} from 'next-intl';

function Component () {
  const intl = useIntl();

  intl.formatNumber(499.90, {style: 'currency', currency: 'USD'});
}
```

See [the MDN docs about `NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#Using_options) to learn more about the options you can pass to `formatNumber`.

### Numbers within messages

Numbers can also be embedded within messages:

```js
{
  "percent": "This product is on sale: {value, number, percent}",
  "percent": "At most 2 fraction digits: {value, number, .##}"
}
```

See the [ICU docs about number skeletons](https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html) to learn more about this syntax.

Additionally, you can configure custom formatters which can be referenced by name:

```js
{
  "price": "This product costs {price, number, currency}"
}
```

```js
t(
  'price',
  {price: 32000.99},
  {
    // Custom formats can be supplied via the third parameter
    number: {
      currency: {
        style: 'currency',
        currency: 'EUR'
      }
    }
  }
);
```

To reuse number formats for multiple components, you can configure [global formats](#global-formats).

## Dates and times

### `formatDateTime`

Similar to number formatting, you can format plain dates and times that are not part of a message with the `useIntl` hook:

```js
import {useIntl} from 'next-intl';

function Component() {
  const intl = useIntl();
  const dateTime = parseISO('2020-11-20T10:36:01.516Z');

  intl.formatDateTime(dateTime, {year: 'numeric', month: 'numeric', day: 'numeric'});
  intl.formatDateTime(dateTime, {hour: 'numeric', minute: 'numeric'});
}
```

See [the MDN docs about `DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#Using_options) to learn more about the options you can provide to `formatDateTime`.

### `formatRelativeTime`

Relative time durations can be formatted with a separate function:

```js
const dateTime = parseISO('2020-11-20T10:36:01.516Z');
const now = parseISO('2020-11-25T10:36:01.516Z');
intl.formatRelativeTime(dateTime, now);
```

Note that values are rounded, so e.g. if 100 seconds have passed, "2 minutes ago" will be returned.

Supplying `now` is necessary for the function to return consistent results. You can provide your own value for `now`, or alternatively use the one provided from `useNow`:

```js
import {useNow} from 'next-intl';

function Component() {
  const now = useNow();

  const dateTime = parseISO('2020-11-20T10:36:01.516Z');
  intl.formatRelativeTime(dateTime, now);
}
```

You can optionally configure an interval when the `now` value should update:

```js
const now = useNow({
  // Update every 10 seconds
  updateInterval: 1000 * 10
});
```

To avoid mismatches between the server and client environment, it is recommended to configure a static global `now` value on the provider:

```js
<NextIntlProvider
  // This value can be generated in data fetching functions of individual pages or `App.getInitialProps`.
  now={now}
  ...
>
  <App />
</NextIntlProvider>
```

This value will be used as the default for the `formatRelativeTime` function as well as for the initial render of `useNow`.

**Important:** When you use `getStaticProps` and no `updateInterval`, this value will be stale. Therefore either regenerate these pages regularly with `revalidate`, use `getServerSideProps` instead or configure an `updateInterval`.

For consistent results in end-to-end tests, it can be helpful to mock this value to a constant value, e.g. based on an environment parameter.

### Dates and times within messages

Dates and times can be embedded within messages as well:

```js
{
  "expiryDate": "{expiryDate, date, ::yyyyMd}"
}
```

See the [FormatJS docs about date time](https://formatjs.io/docs/intl-messageformat#datetime-skeleton) to learn more about this syntax.

Additionally, you can provide custom formats based on [`DateTimeFormat` options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#Using_options):
:

```js
{
  "ordered": "You've ordered this product on {orderDate, date, short}"
}
```

```js
t(
  'orderDate',
  {date: parseISO('2020-11-20T10:36:01.516Z')},
  {
    // Custom formats can be supplied via the third parameter
    dateTime: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    }
  }
);
```

To reuse date and time formats for multiple components, you can configure [global formats](#global-formats).


### Time zones

If possible, you should configure an explicit time zone as this affects the rendering of dates and times. By default, the available time zone of the runtime will be used: In Node.js this is the time zone that is configured for the server and in the browser this is the local time zone of the user. As the time zone of the server and the one from the user will likely be different, this can be problematic when your app is both rendered on the server as well as on the client side.

To avoid such markup mismatches, you can globally define a time zone like this:

```jsx
<NextIntlProvider timeZone="Europe/Vienna">...<NextIntlProvider>
```

This can either be static in your app, or alternatively read from the user profile if you store such a setting. The available time zone names can be looked up in [the tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Global formats

To achieve consistent date, time and number formatting across your app, you can define a set of global formats and pass them to the provider.

```js
<NextIntlProvider
  ...
  formats={{
    dateTime: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    },
    number: {
      precise: {
        maximumFractionDigits: 5
      }
    }
  }}
>
  <App />
</NextIntlProvider>
```

```js
{
  "ordered": "You've ordered this product on {orderDate, date, short}",
  "latitude": "Latitude: {latitude, number, precise}"
}
```

```js
t('ordered', {orderDate: parseISO('2020-11-20T10:36:01.516Z')});
t('latitude', {latitude: 47.414329182});
```

## Error handling

By default, when a message fails to resolve or when the formatting failed, an error will be printed on the console. In this case `${namespace}.${key}` will be rendered instead to keep your app running.

You can customize this behaviour with the `onError` and `getMessageFallback` props of `NextIntlProvider`.

```jsx
import {NextIntlProvider, IntlErrorCode} from 'next-intl';

function onError(error) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and should only log an error
    console.error(error);
  } else {
    // Other errors indicate a bug in the app and should be reported
    reportToErrorTracking(error);
  }
}

function getMessageFallback({namespace, key, error}) {
  const path = [namespace, key].filter((part) => part != null).join('.');

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return `${path} is not yet translated`;
  } else {
    return `Dear developer, please fix this message: ${path}`;
  }
}

<NextIntlProvider ... onError={onError} getMessageFallback={getMessageFallback}>
  <App />
</NextIntlProvider>
```

## Retrieving provider config

As a convenience, two hooks exist that allow to read configuration that was passed to the provider:

```js
// Returns either an explicitly configured locale from the
// provider or if internationalized routing is set up, it
// returns the configured locale from Next.js.
const locale = useLocale(); 

// Note that this will be `undefined` if no explicit
// `timeZone` was configured on the provider.
const timeZone = useTimeZone();
```
