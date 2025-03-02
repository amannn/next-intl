import {describe, expect, it, vi} from 'vitest';
import getDefaultNow from './getDefaultNow.js';
import getFormatter from './getFormatter.js';

vi.mock('react');
vi.mock('./getDefaultNow.tsx', () => ({
  default: vi.fn(() => new Date())
}));

vi.mock('next-intl/config', () => ({
  default: async () =>
    (
      (await vi.importActual('../../../src/server/react-server')) as any
    ).getRequestConfig({
      locale: 'en'
    })
}));

describe('dynamicIO', () => {
  it('should not read `now` unnecessarily', async () => {
    const format = await getFormatter();
    format.dateTime(new Date());
    format.number(1);
    format.dateTimeRange(new Date(), new Date());
    format.list(['a', 'b']);
    format.relativeTime(new Date(), new Date());
    expect(getDefaultNow).not.toHaveBeenCalled();
  });

  it('should read `now` for `relativeTime` if relying on a global `now`', async () => {
    const format = await getFormatter();
    format.relativeTime(new Date());
    expect(getDefaultNow).toHaveBeenCalled();
  });
});
