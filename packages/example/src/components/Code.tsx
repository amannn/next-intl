import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function Code({children}: Props) {
  return (
    <code style={{background: '#eee', padding: 4, borderRadius: 4}}>
      {children}
    </code>
  );
}
