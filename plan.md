# Address TODO Statements in Precompile Branch

Investigate and resolve all TODO statements left in the precompile feature branch, covering rollup externals, format structure alignment, test verification, and bundler alias verification.

## Progress

- [x] TODO 1: Verify rollup externals for icu-minify
- [x] TODO 2: Remove package organization comment
- [x] TODO 3: Align icu-minify/format with use-intl's format structure
- [x] TODO 4: Simplify format-only.tsx after format alignment
- [ ] TODO 5: Verify return type checks can be removed (requires test setup modification)
- [x] TODO 6: Verify Turbo alias path condition (logging added)
- [x] TODO 7: Verify webpack alias works correctly (logging added)

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

- ✅ Remove `convertFormatsToIcuMinify` function entirely
- ✅ Pass `globalFormats` and `formats` directly
- ⚠️ Keep timeZone wrapper around `getDateTimeFormat` (needed for consistency with compile-format.tsx)
- ⚠️ Keep `prepareTranslationValues` workaround (still needed for formatjs issue #1467)

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

**Action:** ✅ Completed - Added console.log in development mode to output relativePath and resolvedAlias values. Logging can be verified when running builds with Turbo. The condition ensures relative paths start with './' for proper resolution.

---

## TODO 10: Webpack alias verification (getNextConfig.tsx:249)

**Action:** ✅ Completed - Added console.log in development mode to output webpack alias configuration. Logging can be verified when running builds without Turbo. The alias uses require.resolve to get the actual file path for proper subpath export resolution.
