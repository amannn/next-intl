import {useExtracted} from 'next-intl';

export function Component() {
  const t = useExtracted();

  // Same message, different descriptions -> distinct hashes
  const header = t({
    message: 'Hello world',
    description: 'Header greeting'
  });

  const footer = t({
    message: 'Hello world',
    description: 'Footer greeting'
  });

  // Same message, no description
  const defaultMsg = t({
    message: 'Hello world'
  });

  return null;
}
