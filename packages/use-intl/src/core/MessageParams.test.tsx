import {assertType, it} from 'vitest';
import MessageParams from './MessageParams.tsx';
import {PlainTranslationValue} from './TranslationValues.tsx';

it('accepts one plain param', () => {
  type Result = MessageParams<'Hello {name}'>;
  assertType<{name: PlainTranslationValue}>({} as Result);
});

it('accepts two plain params', () => {
  type Result = MessageParams<'Hello {name} and {age}'>;
  assertType<{name: PlainTranslationValue; age: PlainTranslationValue}>(
    {} as Result
  );
});

it('accepts cardinal plural params', () => {
  type Result =
    MessageParams<'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.'>;
  assertType<{count: number}>({} as Result);
});

it('accepts ordinal plural params', () => {
  type Result =
    MessageParams<"It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!">;
  assertType<{year: number}>({} as Result);
});

it('accepts select params', () => {
  type Result =
    MessageParams<'{gender, select, female {She} male {He} other {They}} is online.'>;
  assertType<{gender: string}>({} as Result);
});

it('accepts nested rich params', () => {
  type Result =
    MessageParams<'This is <important><very>very</very> important</important>'>;
  assertType<{
    important:
      | ((chunks: React.ReactNode) => React.ReactNode)
      | ((chunks: string) => string);
    very:
      | ((chunks: React.ReactNode) => React.ReactNode)
      | ((chunks: string) => string);
  }>({} as Result);
});

it('accepts complex params', () => {
  type Result =
    MessageParams<'Hello <user>{name}</user>, you have {count, plural, =0 {no followers} =1 {one follower} other {# followers ({count})}}.'>;
  assertType<{
    name: PlainTranslationValue;
    count: number;
    user:
      | ((chunks: React.ReactNode) => React.ReactNode)
      | ((chunks: string) => string);
  }>({} as Result);
});
