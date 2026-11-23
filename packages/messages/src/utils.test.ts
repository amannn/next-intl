import {describe, expect, it, vi} from 'vite-plus/test';
import {warnAboutMissingReferences} from './utils.js';

describe('warnAboutMissingReferences', () => {
  it('warns once per message id without a reference', () => {
    const warn = vi.fn();

    warnAboutMissingReferences(
      [
        {
          description: [],
          id: 'a',
          message: 'a',
          references: [{path: 'components/A.tsx', line: 1}]
        },
        {description: [], id: 'b', message: 'b', references: []},
        {description: [], id: 'b', message: 'b', references: []}
      ],
      warn
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Missing file reference for extracted message: b'
    );
  });
});
