import {describe, expect, it, vi} from 'vitest';
import getDefaultNow from '../server/react-server/getDefaultNow.js';
import {renderToStream} from './testUtils.js';
import useFormatter from './useFormatter.js';

vi.mock('react');
vi.mock('../server/react-server/getDefaultNow.tsx', () => ({
  default: vi.fn(() => new Date())
}));

vi.mock('../../src/server/react-server/createRequestConfig', () => ({
  default: async () => ({
    locale: 'en'
  })
}));

describe('dynamicIO', () => {
  it('should not include `now` in the translator config', async () => {
    function TestComponent() {
      const format = useFormatter();
      format.dateTime(new Date());
      format.number(1);
      format.dateTimeRange(new Date(), new Date());
      format.list(['a', 'b']);
      format.relativeTime(new Date(), new Date());
      return null;
    }

    await renderToStream(<TestComponent />);
    expect(getDefaultNow).not.toHaveBeenCalled();
  });

  it('should read `now` for `relativeTime` if relying on a global `now`', async () => {
    function TestComponent() {
      const format = useFormatter();
      format.relativeTime(new Date());
      return null;
    }

    await renderToStream(<TestComponent />);
    expect(getDefaultNow).toHaveBeenCalled();
  });
});
