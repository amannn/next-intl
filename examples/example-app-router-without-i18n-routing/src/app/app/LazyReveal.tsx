'use client';

import {ReactNode, useEffect, useState} from 'react';

export default function LazyReveal({children}: {children: ReactNode}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 3000);
  }, []);

  return show && children;
}
