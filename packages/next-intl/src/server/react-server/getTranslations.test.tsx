import {createTranslator} from 'use-intl/core';
import {expect, it, vi} from 'vitest';
import getTranslations from './getTranslations.tsx';

vi.mock('react');
vi.mock('use-intl/core');

vi.mock('next-intl/config', () => ({
  default: async () =>
    (
      (await vi.importActual('../../../src/server/react-server')) as any
    ).getRequestConfig({
      locale: 'en',
      timeZone: 'Europe/London',
      messages: {
        title: 'Hello'
      }
    })
}));

it('should not include `now` in the translator config', async () => {
  await getTranslations();

  expect(createTranslator).toHaveBeenCalledWith(
    expect.not.objectContaining({
      now: expect.anything()
    })
  );
});
