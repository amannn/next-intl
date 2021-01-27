import {render, screen} from '@testing-library/react';
import React from 'react';
import {useNow} from '../src';

(global as any).__DEV__ = true;

it('returns now', () => {
  function Component() {
    return <p>{useNow()}</p>;
  }

  render(<Component />);
  screen.getByText('now');
});
