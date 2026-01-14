# Address TODO Statements in Precompile Branch

Investigate and resolve all TODO statements left in the precompile feature branch, covering rollup externals, format structure alignment, test verification, and bundler alias verification.

## Progress

- [ ] TODO 1: Verify rollup externals for icu-minify
- [ ] TODO 2: Remove package organization comment
- [ ] TODO 3: Align icu-minify/format with use-intl's format structure
- [ ] TODO 4: Simplify format-only.tsx after format alignment
- [ ] TODO 5: Verify return type checks can be removed
- [ ] TODO 6: Verify Turbo alias path condition
- [ ] TODO 7: Verify webpack alias works correctly

---

## TODO 1: Rollup externals for icu-minify (rollup.config.js:45-47)

**Question:** Do we need `'icu-minify/compiler'` and `'icu-minify/format'` in the external array?

**Investigation:**

- These are only used by `catalogLoader.tsx` (compiler) and `format-only.tsx` (format)
- `catalogLoader.tsx` is bundled separately and already has `icu-minify` as a dependency in `package.json`
- Check if removing them causes any bundling issues

**Action:** Remove the entries and verify the build still works. If it does, delete them with a note that they're covered by `pkg.dependencies`.

---

## TODO 2: Package organization question (format-message/index.tsx:17)

**Question:** "should we move this to another package for having a clearer dependency?"

**Action:** This is a design consideration for later. Remove the comment - the current aliasing approach is documented in the module header and works well for now.

---

## TODO 3: Return type check in compile-format.tsx (line 114)

**Question:** Is the return type check necessary?

```typescript
return isValidElement(formattedMessage) ||
  Array.isArray(formattedMessage) ||
  typeof formattedMessage === 'string'
  ? formattedMessage
  : String(formattedMessage);
```

**Investigation:**

- Run existing tests for `createTranslator` to see what `messageFormat.format()` can return
- Check `intl-messageformat` types for possible return values

**Action:** Run tests, check if removing the check breaks anything. The check handles edge cases where `format()` returns non-string primitives (numbers, booleans). Likely safe to simplify but verify first.

---

## TODO 4-7: Align icu-minify/format with use-intl's format structure

These TODOs are related and should be addressed together:

| Location            | Issue                                           |
| ------------------- | ----------------------------------------------- |
| format-only.tsx:17  | `dateTime` vs separate `date`/`time` namespaces |
| format-only.tsx:29  | timeZone applied redundantly to formats         |
| format-only.tsx:56  | `prepareTranslationValues` workaround           |
| format-only.tsx:109 | getDateTimeFormat wrapper for timeZone          |

**Changes to icu-minify/format.tsx:**

1. **Change `Formats` type** from:

```typescript
type Formats = {
  date?: Record<string, Intl.DateTimeFormatOptions>;
  time?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
};
```

to:

```typescript
type Formats = {
  dateTime?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
};
```

2. **Update `getDateTimeFormatOptions`** to look up from `formats.dateTime` instead of separate `date`/`time`

3. **Handle timeZone properly** - accept it as a top-level option and apply it internally when calling `getDateTimeFormat`

**Changes to format-only.tsx:**

- Remove `convertFormatsToIcuMinify` function entirely
- Pass `globalFormats` and `formats` directly
- Remove timeZone wrapper around `getDateTimeFormat`
- Simplify `prepareTranslationValues` - verify if the workaround is still needed

---

## TODO 8: Return type check in format-only.tsx (line 129)

**Question:** Can we directly return `formattedMessage` without checks?

**Investigation approach:**

1. Temporarily modify the test setup to use format-only instead of compile-format
2. Run `createTranslator.test.tsx` and `useTranslations.test.tsx`
3. If all tests pass, the return type check can be removed from both files
4. Revert test changes after verification

**Files:**

- [createTranslator.test.tsx](packages/use-intl/src/core/createTranslator.test.tsx)
- [useTranslations.test.tsx](packages/use-intl/src/react/useTranslations.test.tsx)

---

## TODO 9: Turbo alias path condition (getNextConfig.tsx:154)

```typescript
resolveAlias['use-intl/format-message'] = relativePath.startsWith('.')
  ? relativePath
  : './' + relativePath;
```

**Action:** Add `console.log` to output `relativePath` and `resolveAlias` values, run a build with Turbo, verify if the condition is actually needed. Clean up logging after.

---

## TODO 10: Webpack alias verification (getNextConfig.tsx:249)

**Action:** Add `console.log` to output the webpack alias configuration, run a build without Turbo, verify the alias resolves correctly. Clean up logging after.
