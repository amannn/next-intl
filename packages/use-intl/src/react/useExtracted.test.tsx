/* eslint-disable @typescript-eslint/no-unused-vars */
import {describe, it} from 'vitest';
import useExtracted from './useExtracted.js';

describe('type safety', () => {
  it('accepts plain messages', () => {
    function Component() {
      const t = useExtracted();
      t('Hello');
    }
  });

  it('accepts ICU arguments', () => {
    function Component() {
      const t = useExtracted();
      t('Hello {name}', {name: 'World'});
    }
  });

  it('validates ICU arguments', () => {
    function Component() {
      const t = useExtracted();
      // @ts-expect-error -- Missing argument
      t('Hello {name}');
    }
  });

  it('accepts rich text messages', () => {
    function Component() {
      const t = useExtracted();
      t.rich('Hello {name}', {name: 'World'});
    }
  });

  it('accepts markup messages', () => {
    function Component() {
      const t = useExtracted();
      t.markup('Hello {name}', {name: 'World'});
    }
  });

  it("doesn't accept raw messages", () => {
    function Component() {
      const t = useExtracted();
      // @ts-expect-error -- Raw messages are not accepted
      t.raw('Hello {name}', {name: 'World'});
    }
  });

  it('accepts an optional namespace', () => {
    function Component() {
      const t = useExtracted('design-system');
      t('Hello');
    }
  });
});
