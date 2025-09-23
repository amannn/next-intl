# RFC: Message Extraction

Start date: 2025-09-23

## Summary

This RFC proposes a new way to define messages inline that avoids the need for managing keys.

**Example:**

```tsx
import {useExtracted} from 'next-intl';

function InlineMessages() {
  const t = useExtracted();
  return <h1>{t('Look ma, no keys!')}</h1>;
}
```

## Motivation

This RFC was born out of this question: "What would the Tailwind for i18n look like?"

If we consider the design of Tailwind, we can see that an i18n solution that follows the same principles would likely look something like this:

1. **Colocation**: Similar to how Tailwind avoids the need to manage separate stylesheets, there should not be a need for manually managing JSON message catalogs when adding, updating or removing messages. Message catalogs can however be a compile target.
2. **AI-first**: Generative AI is very good at Tailwind due to local reasoning and small context windows. Having to read message catalogs leads to context pollution and should therefore not be necessary (at least not without tool calls).
3. **No naming of things**: Not having to come up with names is a major productivity boost, therefore manual keys should be avoided if not necessary.
4. **Purging**: Similar to how Tailwind can purge unused styles, we should purge unused messages automatically. Related to this, changed messages might need to be invalidated.
5. **Minification**: Tailwind class names have a tiny bundle footprint, messages should also use minified keys (e.g. `uxV9Xq`).
6. **Prototype-friendly, production-ready**: Tailwind looks exactly the same, regardless of it's used in a quick prototype or a production app. In the same way, there should be a single API that avoids upfront decisions related to the project's size and complexity.
7. **Incremental adoption**: Tailwind can be used alongside traditional stylesheets, making it migration-friendly. It should be possible to use inline messages alongside existing translations.
8. **Refactoring-friendly**: Moving code across components is seamless with Tailwind, this should be possible with inline messages as well.

While `next-intl` has answers to some of these questions, ultimately the truth is that there's potential left on the table. Therefore, this RFC aims to introduce a new API that can improve the developer experience for using `next-intl`.

**Important:** This new API is purely additive. All existing functionality will continue to work and will likely also be used behind the scenes by this new API.

## Proposed API

### Simple case

For the simplest case, the API looks like this:

```tsx
import {useExtracted} from 'next-intl';

function InlineMessages() {
  const t = useExtracted();
  return <h1>{t('Look ma, no keys!')}</h1>;
}
```

**Notes:**

1. Neither a namespace nor a key is needed, after calling a hook.
2. Retrieving `t` from a hook allows us to continue accessing messages either from React Context (Client Components) or from `i18n/request.ts` (Server Components).
3. The invocation of `t` can be moved to another component without either having to update a key. The only requirement is that a call to `useExtracted` is present.
4. Server Components can use an awaitable version of the hook like `const t = await getExtracted()`.
5. Dynamic invocations like `t(keyName)` are not allowed and will throw an error.
6. Tooling like [i18n Ally](https://next-intl.dev/docs/workflows/vscode-integration) is no longer needed.

**🏗️ Open questions:**

- array-esque data: you can use hardcoded ids if you want ([ref](https://x.com/jurerotar/status/1960581713723318720)), this avoids msg macro
- can the user fix a label while keeping translations? What if the user types `t(/* keep */ 'Fixed')`, and the compiler does the work and removes the "keep" part. or: a vscode extension that does this
- provide context

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

### Provide more context

If the developer wants to clarify the intent of a message, they can provide a context:

```tsx
t({
  message: 'Right',
  description: 'Advance to the next slide',
}
```

See also [File formats & AI translation](#file-formats--ai-translation) below.

### Use explicit IDs

We can allow the user to set a key explicitly:

```tsx
const t = useExtracted();
t({
  id: 'carousel.next',
  message: 'Right'
});
```

One potential use case is when you have a label that is used in multiple places, but should have different translations in other languages.

**🏗️ Open questions:**

- What if a key already exists? Reuse?
- Markup / rich? shall we keep what we do today or simplify? maybe later
- the [zendesk approach](https://www.youtube.com/watch?v=fUQAXo2DayQ) is pretty cool for this. esp. this: `t('You have ' + t.plural(…))` . maybe i dont need [t.rich](http://t.rich) etc anymore? t.raw always sucked and t.markup … not sure, could detect it if a function returns a string and not a react node?
- how to do rich text with this api? `t(`Check out ${<Link></Link>}`)`
- think: could this be similar to a type-safe sql query builder?
- lingui doesnt have number or date formatter in messages.

### Developer workflow

From the perspective of the developer, the workflow is as follows:

1. Setup `next-intl` with the Next.js plugin
2. Run dev server
3. Write code that references messages
4. All catalogs are continuously updated (source locale: extract, secondary locales: add/invalidate/remove translations)
5. Commit a feature
6. Optional: Use AI for translating new or changed messages

## Implementation details

### Bundler integration

two reloads if we compile with hmr? if we compile to the same component, there should not be a reload. adding a message should trigger a reload however. do we need a fallback however if a component compiles before messages are available? can we ensure we're in the same compile pass? we might have to block the compile.

- crawl based on glob, or entry points/imports? think about how this relates to tree shaking of messages. we surely dont want to output multiple files per locale. tree shaking should happen at runtime
- next-intl could register a .po loader?
- share config between next.config.ts and cli is likely not possible. what if we dont provide a cli, but an import from `next-intl/plugin` , then users can use this in a custom node script. (could also be used for [generating types](https://github.com/amannn/next-intl/issues/1832))
- json file generated, page re-renders (need to check if we need to fallback to source language here or if HMR brings new label. probably depends on the save order?)

### Catalog generation

- file name + md5 hash of content?
- same key already exists (what to do? reuse?)
- invalidation
- how does this work with monorepos? are prefixes necessary?
- why do we need module name as key? this is what will break labels when you move them between components. if json had support for descriptions, we could just update the description and leave the id as-is. but global conflicts are easier then. what if we just use .po files? ([ref](https://x.com/jurerotar/status/1960591924001193997))
- minify keys only in production?
- if a key is only a hash of the content (no namespace), this will automatically conflate usage of existing key. but: edge case can be that you have a label that is the same in one language but not in another (introducing an explicit namespace could help here)
- cli: migrate keys (accept old and new config)
- include all usages in description ([bluesky](https://github.com/bluesky-social/social-app/blob/133bc2921ed9beaafa111afca2404722201f037f/src/locale/locales/de/messages.po#L82-L86), also [same component](https://github.com/bluesky-social/social-app/blob/133bc2921ed9beaafa111afca2404722201f037f/src/locale/locales/de/messages.po#L789-L792))
- https://formatjs.github.io/docs/tooling/cli/#--id-interpolation-pattern-pattern
- react-intl has special json files: https://formatjs.github.io/docs/tooling/cli/#the-resulting-files
- there's generally the question if we should optimize right during extraction, or during build / runtime
  - react-intl: difference between extract and compile (optimize). however, also extracted messages already have optimized key
  - lingui: extract with message as id, optimize with loader
  - next-intl:
    - extract: minify key, add description
    - optimize: could we register a loader, that only loads json file from a particular path with a transformer? that would be nice (what about monorepos? edit glob?)

### File formats & AI translation

Since keys will be autogenerated and are non-descriptive, message extraction requires an equivalent that describes context like where a message is used, what the message is about, and more.

E.g. if you consider this catalog:

```json
{
  "5VpL9Z": "Right"
}
```

… then it's apparent that it's ambiguous whether "right" refers to a direction (left/right) or whether something is correct.

While providing context for translators was always important, esp. with the rise of AI translation, it's becoming more and more important to do this in a structured way that doesn't rely on trying to find messages in a running app.

The following file formats are additionally being considered:

**Portable object (.po)**

```
#. Advance to the next slide
#: src/components/Carousel.tsx:13
msgid "5VpL9Z"
msgstr "Right"
```

The file path can be automatically retrieved during extraction, and also updated if call sites are moved without invalidating the key.

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

While sticking with JSON would be helpful due its popularity, there's unfortunately no universal standard for this.

To only list a few:

1. [Chrome JSON as supported by Crowdin](https://store.crowdin.com/chrome-json)
2. [Structured JSON as supported by Lokalise](https://docs.lokalise.com/en/articles/3229161-structured-json)
3. [Structured JSON as supported by Smartling](https://help.smartling.com/hc/en-us/articles/360008000733-JSON#StringInstructions)
4. [Structured JSON as supported by Transifex](https://help.transifex.com/en/articles/6220899-structured-json)

---

Due to this, it seems like `.po` might qualify as the best option for a default format that doesn't force users down the road to migrate to another format once their app grows. Still, it's important to have this be configurable and also support simple JSON.

## Migration

First of all, if the current APIs of `next-intl` are exactly what you like to use, there's no need to migrate in the first place.

Other than that, there are two use cases:

1. **Mixed codebase**: Users might want to try this API in some places to see if it's a good fit for them, while keeping all existing translations as-is.
2. **Full migration**: If users are interested in migrating to the new API completely, ideally an automated migration is available (e.g. a [Codemod](https://codemod.com/))

**🏗️ Open questions:**

- keys: maybe a default could be no namespace? makes it easy to get started, move files like crazy without issues. for bigger projects and those using ai, you could upgrade to namespace

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
<t.Rich>
  This is <b>important</b>.
</t.Rich>
```

… this however looks entirely different now, it doesn't really appear like a unified API. And there's still even another case with [HTML markup](https://next-intl.dev/docs/usage/translations#html-markup) that we haven't covered.

Apart from rich text, there are other trade-offs:

1. The extractor needs to guess a variable name (e.g. `name` above). While this works for simple cases, it breaks down for more complex cases like `Hello ${getName()}`, so at some point we have to resort to generic names like `$0`, `$1`, etc.
2. For strings like `Page {index, number} out of {total, number}`, we can currently statically analyze with TypeScript that you're using the `number` formatter in the message definition. The same is true for `date`. If we use the above API with simple string concatenation, this is not possible.

So it takes quite a bit of design effort to find something that works well, and also the implementation might take more effort to get right. If we just use inline ICU strings, we can avoid this.

It largely depends on the project, but I've repeatedly seen that the majority of messages are typically simple strings, with rather the minority of cases requiring ICU features. So my impression is that for the common case this shouldn't make a difference anyway and therefore it might not be worth the effort to go down this path.

### Supporting human readable strings as keys

Some of the discussed benefits of this proposal would be possible if we'd allow human readable messages as keys. This is currently not supported because `next-intl` doesn't allow `.` to be used in keys. However, it would be a half-baked feature because you'd still have to extract the messages yourself and also minification isn't possible.

### Macro for defining messages

todo

## Prior art

This RFC draws inspiration from the following projects:

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
- Default format: ICU message format
