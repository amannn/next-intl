import {assertType, it} from 'vitest';
import MessageParams from './MessageParams.tsx';
import {PlainTranslationValue} from './TranslationValues.tsx';

it('handles no params', () => {
  type Result = MessageParams<'Hello'>;
  assertType<{}>({} as Result);
});

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
    MessageParams<'{count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}'>;
  assertType<{count: number}>({} as Result);
});

it('accepts cardinal plural params surrounded by text', () => {
  type Result =
    MessageParams<'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.'>;
  assertType<{count: number}>({} as Result);
});

it('accepts ordinal plural params', () => {
  type Result =
    MessageParams<'{year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'>;
  assertType<{year: number}>({} as Result);
});

it('accepts ordinal plural params surrounded by text', () => {
  type Result =
    MessageParams<"It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!">;
  assertType<{year: number}>({} as Result);
});

it('accepts basic number params', () => {
  type Result = MessageParams<'Basic formatting: {value, number}'>;
  assertType<{value: number}>({} as Result);
});

it('accepts number params with percent format', () => {
  type Result =
    MessageParams<'Displayed as a percentage: {value, number, percent}'>;
  assertType<{value: number}>({} as Result);
});

it('accepts number params with a skeleton format', () => {
  type Result =
    MessageParams<'At most 2 fraction digits: {value, number, ::.##}'>;
  assertType<{value: number}>({} as Result);
});

it('accepts date params with predefined format', () => {
  type Result = MessageParams<'Ordered on {orderDate, date, medium}'>;
  assertType<{orderDate: Date | number}>({} as Result);
});

it('accepts date params with a skeleton format', () => {
  type Result = MessageParams<'Ordered on {orderDate, date, ::yyyyMMMd}'>;
  assertType<{orderDate: Date | number}>({} as Result);
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
