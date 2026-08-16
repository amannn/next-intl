import {expect, it} from 'vitest';
import msg, {type ExtractedMessage, defineMessage} from './msg.js';

it('returns the source message when uncompiled', () => {
  expect(msg('Pending')).toBe('Pending');
});

it('accepts the object form', () => {
  expect(
    msg({
      message: 'Save',
      description: 'Form submit button',
      namespace: 'ui'
    })
  ).toBe('Save');
});

it('is aliased as defineMessage', () => {
  expect(defineMessage).toBe(msg);
  expect(defineMessage('Pending')).toBe('Pending');
});

it('preserves the ICU message type', () => {
  const greeting = msg('Hello {name}!');
  const typed: ExtractedMessage<'Hello {name}!'> = greeting;
  expect(typed).toBe('Hello {name}!');
});
