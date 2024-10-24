import clsx from 'clsx';
import {ReactNode} from 'react';
import styles from './CodeSnippet.module.css';

type Props = {
  children: ReactNode;
};

export default function CodeSnippet({children}: Props) {
  return (
    <code className={clsx('grid px-4 text-sm leading-[1.5em]', styles.root)}>
      {children}
    </code>
  );
}
