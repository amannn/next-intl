# Usage guide

## Providing messages to components

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
        <button type="submit">{t('form.submit')}
      </form>
    </>
  );
}
```

You don't have to group messages by components – use whatever suits your use case. You can theoretically use a common key for shared labels that are used frequently. However, from my experience I think it's often beneficial to duplicate labels across components, even if they are the same in one language. Depending on the context, a different label can be more appropriate (e.g. "not now" instead of "cancel"). Duplicating the labels allows to easily change them later on in case you want something more specific. Duplication on the network level is typically solved by gzip. In addition to this, you can achieve reuse by using shared components.

To retrieve all available messages in a component, you can omit the namespace path:

```js
const t = useTranslations();
```

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

  // See https://formatjs.io/docs/core-concepts/icu-syntax/#rich-text-formatting
  // and https://formatjs.io/docs/intl-messageformat/#rich-text-support
  "richText": "This is <important><very>very</very> important</important>",

  // Messages can be used in attributes as well
  "attributeUrl": "https://example.com"
}
```

```js
t('static');
t('interpolation', {name: 'Jane'});
t('plural', {numMessages: 3});
t('selectordinal', {year: 11});
t('richText', {
  important: (children) => <b>{children}</b>,
  very: (children) => <i>{children}</i>
})
// TypeScript note: You have to cast the attribute to a string, since it 
// can theoretically return a `ReactNode`: `String(t('attributeUrl'))`
<a href={t('attributeUrl')}>Link</a>
```

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
  const dateTime = new Date('2020-11-20T10:36:01.516Z');

  intl.formatDateTime(dateTime, {year: 'numeric', month: 'numeric', day: 'numeric'});
  intl.formatDateTime(dateTime, {hour: 'numeric', minute: 'numeric'});
}
```

See [the MDN docs about `DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#Using_options) to learn more about the options you can provide to `formatDateTime`.

### `formatRelativeTime`

Relative time durations can be formatted with a separate function:

```js
const dateTime = new Date('2020-11-20T10:36:01.516Z');
const now = new Date('2020-11-25T10:36:01.516Z');
intl.formatRelativeTime(dateTime, now);
```

Note that values are rounded, so e.g. if 100 seconds have passed, "2 minutes ago" will be returned.

Supplying `now` is necessary for the function to return consistent results. You can provide your own value for `now`, or alternatively use the one provided from `useNow`:

```js
import {useNow} from 'next-intl';

function Component() {
  const now = useNow();

  const dateTime = new Date('2020-11-20T10:36:01.516Z');
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
  {date: new Date('2020-11-20T10:36:01.516Z')},
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

To avoid such mismatches, you can globally define a time zone like this:

```jsx
<NextIntlProvider timeZone="Austria/Vienna">...<NextIntlProvider>
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
t('ordered', {orderDate: new Date('2020-11-20T10:36:01.516Z')});
t('latitude', {latitude: 47.414329182});
```

## Error handling

By default, when a message fails to resolve or when the formatting failed, an error will be printed on the console. In this case `${namespace}.${key}` will be rendered instead to keep your app running.

You can customize this behaviour with the `onError` and `getMessageFallback` props of `NextIntlProvider`.

```jsx
import {NextIntlProvider, IntlErrorCode} from 'next-intl';

function onError(error) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected should only log an error
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
