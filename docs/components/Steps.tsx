import {ReactNode} from 'react';
import styles from './Steps.module.css';

type Props = {
  children: ReactNode;
};

export default function Steps({children}: Props) {
  return <div className={styles.root}>{children}</div>;
}
