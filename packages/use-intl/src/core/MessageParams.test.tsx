import {assertType, describe, it} from 'vitest';
import {MessageParams, MessageParamsRichText} from './MessageParams.tsx';
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
  assertType<{count: PlainTranslationValue}>({} as Result);
});

it('accepts cardinal plural params surrounded by text', () => {
  type Result =
    MessageParams<'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.'>;
  assertType<{count: PlainTranslationValue}>({} as Result);
});

it('can use a value both as a plain param as well as a plural param', () => {
  type Result =
    MessageParams<'{count, plural, =0 {no followers yet} =1 {one follower} other {# followers}} {count}'>;
  assertType<{count: PlainTranslationValue}>({} as Result);
});

it('can use a plain param within a plural param', () => {
  type Result =
    MessageParams<'{count, plural, zero {{zero}} one {{one}} two {{two}} few {{few}} many {{many}} =24 {{custom}} other {{other}}}'>;
  assertType<{
    count: PlainTranslationValue;
    zero: PlainTranslationValue;
    one: PlainTranslationValue;
    two: PlainTranslationValue;
    few: PlainTranslationValue;
    many: PlainTranslationValue;
    custom: PlainTranslationValue;
  }>({} as Result);
});

it('can combine a plain param with a plural param', () => {
  type Result =
    MessageParams<'{name} has {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}'>;
  assertType<{name: PlainTranslationValue; count: PlainTranslationValue}>(
    {} as Result
  );
});

it('accepts ordinal plural params', () => {
  type Result =
    MessageParams<'{year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'>;
  assertType<{year: PlainTranslationValue}>({} as Result);
});

it('accepts ordinal plural params surrounded by text', () => {
  type Result =
    MessageParams<"It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!">;
  assertType<{year: PlainTranslationValue}>({} as Result);
});

it('accepts basic number params', () => {
  type Result = MessageParams<'Basic formatting: {value, number}'>;
  assertType<{value: PlainTranslationValue}>({} as Result);
});

it('accepts number params with percent format', () => {
  type Result =
    MessageParams<'Displayed as a percentage: {value, number, percent}'>;
  assertType<{value: PlainTranslationValue}>({} as Result);
});

it('accepts number params with a skeleton format', () => {
  type Result =
    MessageParams<'At most 2 fraction digits: {value, number, ::.##}'>;
  assertType<{value: PlainTranslationValue}>({} as Result);
});

it('accepts date params with predefined format', () => {
  type Result = MessageParams<'Ordered on {orderDate, date, medium}'>;
  assertType<{orderDate: PlainTranslationValue}>({} as Result);
});

it('accepts date params with a skeleton format', () => {
  type Result = MessageParams<'Ordered on {orderDate, date, ::yyyyMMMd}'>;
  assertType<{orderDate: PlainTranslationValue}>({} as Result);
});

it('accepts select params', () => {
  type Result =
    MessageParams<'{gender, select, female {She} male {He} other {They}} is online.'>;
  assertType<{gender: PlainTranslationValue}>({} as Result);
});

it('accepts a combination of value types', () => {
  type Result =
    MessageParams<'<user>{name}</user> ordered {count, plural, =0 {nothing} =1 {one item} other {# items}} on {orderDate, date, medium}. {gender, select, female {She} male {He} other {They}} paid {price, number, ::currency/USD .00}'>;
  assertType<{
    name: PlainTranslationValue;
    count: PlainTranslationValue;
    orderDate: PlainTranslationValue;
    gender: PlainTranslationValue;
    price: PlainTranslationValue;
    user:
      | ((chunks: React.ReactNode) => React.ReactNode)
      | ((chunks: string) => string);
  }>({} as Result);
});

describe('MessageParamsRichText', () => {
  it('accepts nested rich params', () => {
    type Result =
      MessageParamsRichText<'This is <important><very>very</very> important</important>'>;
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
      MessageParamsRichText<'Hello <user>{name}</user>, you have {count, plural, =0 {no followers} =1 {one follower} other {# followers ({count})}}.'>;
    assertType<{
      name: PlainTranslationValue;
      count: PlainTranslationValue;
      user:
        | ((chunks: React.ReactNode) => React.ReactNode)
        | ((chunks: string) => string);
    }>({} as Result);
  });
});

