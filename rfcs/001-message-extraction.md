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

Two potential APIs are being considered:

1. Inline ICU syntax
2. Builder pattern

The interesting case is how to provide arguments to messages: TODO

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

- next-intl extraction could optionally serve as auto context enrichment in the future
- less ai context if there are no ids
- if a key is only a hash of the content (no namespace), this will automatically conflate usage of existing key. but: edge case can be that you have a label that is the same in one language but not in another (introducing an explicit namespace could help here)
- see https://formatjs.github.io/docs/tooling/cli/#builtin-formatters
- potentially allow custom formatters (later)

## Migration

First of all, if the current APIs of `next-intl` are exactly what you like to use, there's no need to migrate in the first place.

Other than that, there are two use cases:

1. **Mixed codebase**: Users might want to try this API in some places to see if it's a good fit for them, while keeping all existing translations as-is.
2. **Full migration**: If users are interested in migrating to the new API completely, ideally an automated migration is available (e.g. a [Codemod](https://codemod.com/))

**🏗️ Open questions:**

- keys: maybe a default could be no namespace? makes it easy to get started, move files like crazy without issues. for bigger projects and those using ai, you could upgrade to namespace

## Discarded alternatives

- **Supporting human readable strings as keys**: Some of the discussed benefits of this proposal would be possible if we'd allow human readable messages as keys. This is currently not supported because `next-intl` doesn't allow `.` to be used in keys. However, it would be a half-baked feature because you'd still have to extract the messages yourself and also minification isn't possible.
- **Macro**:

## Prior art

This RFC draws inspiration from the following projects:

| Name                                                                 | Code example                                                                       | Default key strategy            |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| [gettext](https://en.wikipedia.org/wiki/Gettext)                     | `printf(_("My name is %s.\n"), my_name)`                                           | N/A (uses message as key)       |
| [Lingui](https://lingui.dev/)                                        | `<Trans>My name is {name}.</Trans>`                                                | TODO                            |
| [FormatJS](https://formatjs.github.io/docs/tooling/cli#extraction-1) | `<FormattedMessage defaultMessage="My name is {name}." values={{name: 'John'}} />` | `[sha512:contenthash:base64:6]` |
