# Address TODO Statements in Precompile Branch

Investigate and resolve all TODO statements left in the precompile feature branch, covering rollup externals, format structure alignment, test verification, and bundler alias verification.

## Summary

All TODOs have been completed and all tests are now passing. Key fixes:
- Fixed timezone handling to use system timezone when `timeZone` is not provided
- Aligned icu-minify format structure with use-intl's unified `dateTime` namespace
- Removed unnecessary return type checks from format-only.tsx
- Fixed error handling in createBaseTranslator (array checks, error code differentiation)

## Progress

- [x] TODO 1: Verify rollup externals for icu-minify
- [x] TODO 2: Remove package organization comment
- [x] TODO 3: Align icu-minify/format with use-intl's format structure
- [x] TODO 4: Simplify format-only.tsx after format alignment
- [x] TODO 3: Verify return type check in compile-format.tsx
- [x] TODO 5: Verify return type check in format-only.tsx
- [x] TODO 6: Verify Turbo alias path condition
- [x] TODO 7: Verify webpack alias works correctly

---

## TODO 1: Rollup externals for icu-minify (rollup.config.js:45-47)

**Question:** Do we need `'icu-minify/compiler'` and `'icu-minify/format'` in the external array?

**Investigation:**

- These are only used by `catalogLoader.tsx` (compiler) and `format-only.tsx` (format)
- `catalogLoader.tsx` is bundled separately and already has `icu-minify` as a dependency in `package.json`
- Check if removing them causes any bundling issues

**Action:** ✅ Verified - The externals are needed for proper subpath export resolution. Updated comment to clarify they're needed for icu-minify subpath exports (used by catalogLoader.tsx and format-only.tsx).

---

## TODO 2: Package organization question (format-message/index.tsx:17)

**Question:** "should we move this to another package for having a clearer dependency?"

**Action:** ✅ Completed - Comment was not found in the codebase (may have been removed already). The current aliasing approach is documented in the module header.

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

**Action:** ✅ Completed - Simplified the return type check. Verified that `intl-messageformat.format()` can return non-string primitives (numbers, booleans) in edge cases, so we keep a simplified check that converts non-string/non-ReactNode values to strings. The check is now more explicit about handling edge cases.

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

- ✅ Remove `convertFormatsToIcuMinify` function entirely
- ✅ Pass `globalFormats` and `formats` directly
- ⚠️ Keep timeZone wrapper around `getDateTimeFormat` (needed for consistency with compile-format.tsx)
- ⚠️ Keep `prepareTranslationValues` workaround (still needed for formatjs issue #1467)

---

## TODO 8: Return type check in format-only.tsx (line 129)

**Question:** Can we directly return `formattedMessage` without checks?

**Investigation approach:**

1. ✅ Temporarily modified test setup with mock to use format-only instead of compile-format
2. ✅ Ran `createTranslator.test.tsx` tests with format-only mock
3. ✅ Verified that icu-minify's `format()` returns `string | RichTextElement | Array<string | RichTextElement>`, which matches `ReactNode`
4. ✅ Removed return type check from format-only.tsx - tests pass
5. ✅ Reverted test mock changes

**Result:** ✅ The return type check can be removed from format-only.tsx. icu-minify's format function always returns valid ReactNode types (string, ReactElement, or arrays), so no conversion is needed. The check was removed and tests pass.

---

## TODO 9: Turbo alias path condition (getNextConfig.tsx:154)

```typescript
resolveAlias['use-intl/format-message'] = relativePath.startsWith('.')
  ? relativePath
  : './' + relativePath;
```

**Action:** ✅ Completed - Verified the condition is needed. The condition ensures relative paths start with './' for proper Turbo resolution. Removed temporary logging after verification.

---

## TODO 10: Webpack alias verification (getNextConfig.tsx:249)

**Action:** ✅ Completed - Verified webpack alias works correctly. The alias uses require.resolve to get the actual file path for proper subpath export resolution. Removed temporary logging after verification.
