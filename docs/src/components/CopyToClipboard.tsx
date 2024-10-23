import type {ComponentProps, ReactElement} from 'react';
import {useCallback, useEffect, useState} from 'react';
import Button from './Button';
import CheckIcon from './icons/CheckIcon';
import CopyIcon from './icons/CopyIcon';

export default function CopyToClipboard({
  getValue,
  ...props
}: ComponentProps<typeof Button> & {
  getValue(): string;
}): ReactElement {
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timerId = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  const handleClick = useCallback(async () => {
    setCopied(true);
    try {
      await navigator.clipboard.writeText(getValue());
    } catch {
      console.error('Failed to copy!');
    }
  }, [getValue]);

  const IconToUse = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      onClick={handleClick}
      title="Copy code"
      variant="outline"
      {...props}
    >
      <IconToUse className="nextra-copy-icon" height="16" />
    </Button>
  );
}
