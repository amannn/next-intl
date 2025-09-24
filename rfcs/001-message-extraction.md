# RFC: Message Extraction

Start date: 2025-09-24

## Summary

This RFC proposes a new way to define messages inline that avoids the need for managing keys.

```tsx
import {useExtracted} from 'next-intl';

function InlineMessages() {
  const t = useExtracted();
  return <h1>{t('Look ma, no keys!')}</h1>;
}
```

This document contains a lot of background information and reasoning regarding API design and is intended for early adopters who are interested in providing feedback. The eventual goal for end users is to get started without much explanation, so don't feel obliged to dig into this if you're only interested in using this API in the future.

**Table of contents:**

- [Motivation](#motivation)
- [Proposed API](#proposed-api)
  - [Simple, plain strings](#simple-plain-strings)
  - [Statically analyzable](#statically-analyzable)
  - [ICU features](#icu-features)
  - [Provide more context](#provide-more-context)
  - [Explicit IDs](#explicit-ids)
  - [Developer workflow](#developer-workflow)
- [Implementation details](#implementation-details)
  - [File formats & AI translation](#file-formats--ai-translation)
  - [Generating minified keys](#generating-minified-keys)
  - [Catalog generation](#catalog-generation)
  - [Bundler integration](#bundler-integration)
- [Migration](#migration)
- [Tradeoffs](#tradeoffs)
- [Considered alternatives](#considered-alternatives)
  - [Direct concatenation of arguments](#direct-concatenation-of-arguments)
  - [Supporting human readable strings as keys](#supporting-human-readable-strings-as-keys)
  - [Macro for defining messages](#macro-for-defining-messages)
- [Prior art & credits](#prior-art--credits)

→ [Discussion](https://github.com/amannn/next-intl/discussions/2036)

## Motivation

This RFC was born out of this question: "What would the Tailwind for i18n look like?"

If we consider the design of Tailwind, we can see that an i18n solution that follows the same principles might look something like this:

1. **Colocation**: Similar to how Tailwind avoids the need to manage separate stylesheets, there should not be a need for manually managing JSON message catalogs when adding, updating or removing messages. Message catalogs can however act as a compile target.
2. **AI-first**: Generative AI is very good at Tailwind due to local reasoning and small context windows. Having to read entire message catalogs leads to context pollution and should therefore not be necessary (at least not without tool calls).
3. **No naming of things**: Not having to come up with names is a major productivity boost, therefore manual keys should be avoided as much as possible.
4. **Purging**: Similar to how Tailwind can purge unused styles, we should purge unused messages automatically. Related to this, changed messages might need to be invalidated.
5. **Minification**: Tailwind class names have a tiny bundle footprint, messages should also use minified keys (e.g. `uxV9Xq`).
6. **Prototype-friendly, production-ready**: Tailwind looks exactly the same, regardless of whether it is used for a quick prototype or a production app. In the same way, there should be a single API that avoids upfront structural decisions related to the project's size and complexity.
7. **Incremental adoption**: Tailwind can be used alongside traditional stylesheets, making it migration-friendly. It should be possible to use inline messages alongside existing translations.
8. **Refactoring-friendly**: Moving code across components is seamless with Tailwind, this should be possible with inline messages as well.

While `next-intl` has answers to some of these questions, ultimately the truth is that there's currently potential left on the table. Therefore, this RFC aims to introduce a new API that can improve the developer experience for using `next-intl`.

**Important:** This new API is purely additive. All existing functionality will continue to work and will likely also be used behind the scenes by this new API.

## Proposed API

### Simple, plain strings

For the simplest case, the API looks like this:

```tsx
import {useExtracted} from 'next-intl';

function InlineMessages() {
  const t = useExtracted();
  return <h1>{t('Look ma, no keys!')}</h1>;
}
```

**Notes:**

1. Neither a namespace nor a key is needed.
2. Retrieving `t` from a hook allows us to continue accessing messages either from React Context (Client Components) or from `i18n/request.ts` (Server Components).
3. The invocation of `t` can be moved to another component without having to update a key. The only requirement is that a call to `useExtracted` is present.
4. Server Components can use an awaitable version of the hook like `const t = await getExtracted()`.
5. Dynamic invocations like `t(keyName)` are not allowed and will print an error (related: [Statically analyzable](#statically-analyzable))
6. Tooling like [i18n Ally](https://next-intl.dev/docs/workflows/vscode-integration) is no longer needed.
7. If the same label is used in multiple places, it will be reused automatically (related: [Explicit IDs](#explicit-ids))
8. `t.raw` is not supported with this API.

### Statically analyzable

Since an extractor needs to be able to statically analyze the code, users can't use dynamic invocations:

```tsx
// ❌ Will print an error
t(keyName);
```

E.g. for arrays of items, this pattern is recommended:

```tsx
const items = [
  {
    title: t('Years of service'),
    value: 34
  },
  {
    title: t('Happy clients'),
    value: 1000
  }
];
```

Besides message extraction, static analysis of messages might in the future be used for [tree shaking](https://github.com/amannn/next-intl/issues/1), therefore this restriction is important beyond the scope of this RFC.

### ICU features

For ICU features like argument interpolation, the ICU string can be defined inline and enriched with values:

```tsx
t('Hello, {name}!', {name: 'John'});
t(
  'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.',
  {count: 3580}
);
t(
  "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
  {year: 2025}
);
t('{gender, select, female {She} male {He} other {They}} is online.', {
  gender: 'female'
});
t.rich('Please refer to the <link>guidelines</link>.', {
  link: (chunks) => <Link href="/guidelines">{chunks}</Link>
});
```

Note that we can piggyback on the recently-introduced [strictly-typed ICU arguments](https://next-intl.dev/blog/next-intl-4-0#strictly-typed-icu-arguments) to validate aspects like:

1. Are the correct values provided?
2. Are `number` and `date` formatters used when passing such a value?

Another benefit of the inline API is that we're no longer limited by [TypeScript#32063](https://github.com/microsoft/TypeScript/issues/32063).

Related: [Direct concatenation of arguments](#direct-concatenation-of-arguments)

### Provide more context

If the developer wants to clarify the intent of a message, they can provide additional context:

```tsx
t({
  message: 'Right',
  description: 'Advance to the next slide'
});
```

Related: [File formats & AI translation](#file-formats--ai-translation)

### Explicit IDs

Optionally, the user can set a key explicitly:

```tsx
const t = useExtracted();
t({
  id: 'carousel.next',
  message: 'Right'
});
```

One use case is when you have a label that is used in multiple places, but should have different translations in other languages. This is an escape hatch that should rarely be necessary.

### Developer workflow

From the perspective of the developer, the workflow is as follows:

1. Setup `next-intl` with the Next.js plugin
2. Run dev server
3. Write code with inline messages
4. All catalogs are continuously updated (related: [Catalog generation](#catalog-generation))
5. Commit a feature
6. Optional: Translate new or changed messages with AI or via manual translation

## Implementation details

### File formats & AI translation

Since keys will be autogenerated and are non-descriptive, message extraction requires an equivalent that describes context like where a message is used and what it intends to convey.

E.g. if you consider this catalog:

```json
{
  "5VpL9Z": "Right"
}
```

… then it's ambiguous whether "right" refers to a direction (left/right) or whether something is correct.

While providing context for translators was always important, especially with the rise of AI translation, it's becoming more and more important to do this in a structured way that doesn't rely on trying to find messages in a running app.

The following file formats are being considered:

**Portable object (.po)**

```
#. Advance to the next slide
#: src/components/Carousel.tsx:13
msgid "5VpL9Z"
msgstr "Right"
```

File path(s) can be automatically retrieved during extraction, and also updated if call sites are moved without invalidating the key.

Additionally, descriptions can optionally be attached to messages. There's also potential here for AI to automatically enrich the descriptions based on the context of the message (related: [Crowdin Context Harvester](https://store.crowdin.com/crowdin-context-harvester-cli)).

**Structured JSON**

```json
{
  "5VpL9Z": {
    "description": "Advance to the next slide",
    "message": "Right"
  }
}
```

This is an example of what [`chrome.i18n`](https://developer.chrome.com/docs/extensions/reference/api/i18n) uses.

While sticking with JSON would be helpful due its popularity and compatibility, there's unfortunately no universal standard for this.

To only list a few:

1. [Chrome JSON as supported by Crowdin](https://store.crowdin.com/chrome-json)
2. [Structured JSON as supported by Lokalise](https://docs.lokalise.com/en/articles/3229161-structured-json)
3. [Structured JSON as supported by Smartling](https://help.smartling.com/hc/en-us/articles/360008000733-JSON#StringInstructions)
4. [Structured JSON as supported by Transifex](https://help.transifex.com/en/articles/6220899-structured-json)

---

Due to this, it seems like `.po` might qualify as the best option for a default format that doesn't force users down the road to migrate to another format once their app grows. Still, it's important to have this be configurable and also support simple JSON.

**Future explorations:**

- A migration script for migrating from one format to another

### Generating minified keys

An important consideration is which aspects of a message are used when generating minified keys.

To avoid invalidating messages that are moved between components, file paths and names will _not_ be included in the key.

Instead, keys should only hash the message content:

```tsx
const message = 'Hello {name}';
const hash = crypto.createHash('sha512').update(message).digest();
const base64 = hash.toString('base64');
const key = base64.slice(0, 6);

key === 'QM7ITA';
```

**Notes:**

- In my benchmarks on a 2019 MacBook Pro, SHA-512 appears to produce similar results as SHA-256 for real-world use cases, there doesn't seem to be a clear winner. FormatJS uses SHA-512, so being compatible here might be helpful.
- Base64 is helpful to reduce collision risk (e.g. compared to hex), while keeping the key readable (e.g. avoiding cryptic symbols)

### Catalog generation

**Workflows:**

- **A new message is added**: Extract the message to the source locale catalog and add empty translations for all secondary locales
- **A message is updated**: Extract the message to the source locale catalog and reset translations for all secondary locales
- **A message is removed**: Extract the message to the source locale catalog and remove translations for all secondary locales

**Potential future explorations:**

- **Typo fixing**: Consider adding a workflow to fix typos in the source language while keeping existing translations (e.g. a magic comment like `t(/* keep */ 'Fixed message')` that is automatically removed during extraction)
- **Monorepo namespaces**: In complex monorepo setups, users might want to merge messages from multiple packages into a single catalog that is used at runtime. We could consider adding an optional namespace like `useExtracted('design-system')` that ensures overlapping keys are not merged.

### Bundler integration

The extraction is primarily designed to be used with a running dev server. A Turbopack plugin will analyze relevant code, extract messages and will transform the source file to use a generated key that is referenced with `useTranslations()`.

To get the extracted messages back into the app, a Turbopack loader will transform the messages catalogs on-the-fly into simple JSON messages that can be returned from `i18n/request.ts`. This happens behind the scenes and there's no public API necessary.

For edge cases, one-off extraction will be possible, but potentially only with a Node.js API and no separate CLI. The reason is some configuration will be necessary and this way it can be shared across the Next.js plugin in `next.config.ts` and potential custom scripts. A config file like `next-intl.config.js` should be avoided.

## Migration

First of all, if the current APIs of `next-intl` are exactly what you like to use, there's no need to migrate in the first place.

Other than that, there are two use cases:

1. **Mixed codebases**: Users might want to try this API in some places to see if it's a good fit for them, while keeping all existing translations as-is.
2. **Full migration**: If users are interested in migrating to the new API completely, ideally an automated migration is available (e.g. a [Codemod](https://codemod.com/))

## Tradeoffs

1. **Relies on a build step:** The current API with `useTranslations` in theory works without a build step, but especially with recent innovations like `'use client'` it's clear that build steps are here to stay.
2. **Reset of translations:** If a translation is fixed in the source locale, the translations of secondary locales will be reset. While this might be desired for substantial changes, it can be annoying e.g. for fixing typos. I think there's room for special handling of this case though (see [Catalog generation](#catalog-generation).)
3. **Changing source locale translations in a TMS (Translation Management System):** This would lead to a weird situation where the code contains a label that doesn't appear in this form in the app. Maybe it's more an educational problem where changes to the source locale catalog should always be done by developers in app code.

## Considered alternatives

### Direct concatenation of arguments

Another approach for defining messages is to directly interpolate values into translations:

```tsx
t(`Hello ${name}!`);
```

If you take a few more ICU features into account, it could look like this:

```tsx
t(`Published on ${t.date(publishedAt)}!`);
t(`Page {${t.number(index)} out of ${t.number(total)}}`);
t(
  `You have ${t.plural(count, {
    one: 'one follower',
    other: '# followers'
  })}`
);
t(`It's your ${t.ordinal(year)} birthday!`);
t(
  `${t.select(gender, {
    female: 'She',
    male: 'He',
    other: 'They'
  })} is online.`
);
```

This might be fine, but in the case of rich text this gets more complicated:

```tsx
// ❌ We can't concatenate strings with JSX elements
t.rich('This is ' + <b>{userName}</b> + '.');

// Let's assume we pass the parts individually …
t.rich('This is ', <b>{userName}</b>, '.');

// ❌ But now, how can we define static text within JSX? Another call to `t`?
t.rich('This is ', <b>{t('important')}</b>, '.');
```

It seems like a JSX-based alternative works better here:

```tsx
<t.rich>
  This is <b>important</b>.
</t.rich>
```

… this however feels a bit clunky, it doesn't really appear like a unified API in combination with `t`.

Having a non-JSX variant is very important for certain use cases:

```tsx
function onClick() {
  setNotification(t('Successfully sent'));
}

<img alt={t('Red running shoes on white background')} src="/shoes.jpg" />;
```

It might be personal taste, but a JSX-based approach can also become quite opaque for complex cases:

```tsx
// What are the static parts that will be extracted? 🤔
<t.rich>
  Visit
  <Link to="/users/jane">{(await getUser()).name}'s profile</Link>
  to learn more
</t.rich>;

// … in comparison to:
t("Visit <link>{name}'s profile</link> to learn more", {
  name: (await getUser()).name,
  link: (chunks) => <Link to="/users/jane">{chunks}</Link>
});
```

Also, there's another case with [HTML markup](https://next-intl.dev/docs/usage/translations#html-markup) that we haven't even covered yet.

Apart from rich text, there are other trade-offs:

1. The extractor needs to guess a variable name (e.g. `name` in the first example above). While this works for simple cases, it breaks down for more complex cases like `Hello ${getName()}`, so at some point we have to resort to generic names like `$0`, `$1`, etc.
2. For strings like `Page {index, number} out of {total, number}`, we can currently statically analyze with TypeScript that you're using the `number` formatter in the message definition. The same is true for `date`. If we use the above API with simple string concatenation, this is not possible.
3. If we ever add a [macro for defining messages](#macro-for-defining-messages), this approach can't be used since arguments might not be available where the message is defined.

So it takes quite a bit of design effort to find something that works well, and also the implementation might take more effort to get right. If we just use inline ICU strings, we can avoid this.

It largely depends on the project, but I've repeatedly seen that the majority of messages in a typical app are simple strings, with rather the minority of cases requiring ICU features. So my impression is that for the common case this shouldn't make a difference anyway and therefore it might not be worth the effort to go down this path.

### Supporting human readable strings as keys

Some of the discussed benefits of this proposal would be possible if we'd allow human readable messages as keys. This is currently not supported because `next-intl` doesn't allow `.` to be used in keys.

However, it would be an incomplete feature because you'd still have to extract the messages yourself and also minification isn't possible.

### Macro for defining messages

Other solutions allow defining messages outside of components, e.g.:

```tsx
// Define a message …
const message = msg`Hello {name}`;

// … and use it later
t(message, {name: 'John'});
```

The issue with this pattern is however that we can't statically analyze which module graphs use which messages (related to [next-intl#1](https://github.com/amannn/next-intl/issues/1)).

Additionally, we already restrict calls to `t` to be in components to avoid [stale translations](https://next-intl.dev/blog/translations-outside-of-react-components), so potentially it could simplify the mental model to also not allow the definition of messages outside of components.

Related: [Statically analyzable](#statically-analyzable)

## Prior art & credits

This RFC draws a lot of inspiration from the following projects:

**gettext**

- Code example: `printf(_("My name is %s.\n"), my_name)`
- Default key strategy: N/A (uses message as key)
- Default format: `.pot`

**Lingui**

- Code example: `<Trans>My name is {name}.</Trans>`
- Default key strategy: [`hexToBase64(sha256(msg + UNIT_SEPARATOR + (context | ""))).slice(0, 6)`](https://github.com/lingui/js-lingui/blob/551950e1f743757101f036cd36282765c4203105/packages/message-utils/src/generateMessageId.ts)
- Default format: `.po`

**FormatJS**

- Code example: `<FormattedMessage defaultMessage="My name is {name}." values={{name: 'John'}} />`
- Default key strategy: `[sha512:contenthash:base64:6]`
- Default format: Chrome JSON

Many thanks to the authors of these projects for their work and inspiration!
