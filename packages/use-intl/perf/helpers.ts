/**
 * Shared primitives for all `*.perf-test.ts` files.
 *
 * Keep this file focused on types that are genuinely reused across tests.
 * One-off types belong in the test file that uses them.
 */

/** Single decimal digit as a string literal union (0–9, 10 members). */
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** Two-digit cartesian product (00–99, 100 members). Use for bulk key generation. */
export type TwoDigit = `${Digit}${Digit}`;

/**
 * ICU argument options match `ICUArgsWithTags` in `createTranslator.tsx`.
 * Every test that touches `ICUArgs` directly should use this so the
 * measured types reflect actual production behavior.
 */
export type ICUArgOpts = {
  ICUArgument: string;
  ICUNumberArgument: number | bigint;
  ICUDateArgument: Date;
};

/**
 * Type-level assertion. Resolves to `true` when `T extends Expected`, else `never`.
 *
 * A result of `never` means the type under test no longer satisfies the
 * expected shape – treat it as a type-level regression test.
 *
 * @example
 *   type _ = Assert<ICUArgs<'Hello {name}', ICUArgOpts>, {name: string}>;
 */
export type Assert<T, Expected> = [T] extends [Expected] ? true : never;
