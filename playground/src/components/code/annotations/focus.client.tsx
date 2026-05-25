'use client';

import React, {useLayoutEffect, useRef} from 'react';
import type {AnnotationHandler} from 'codehike/code';
import {InnerPre, getPreRef} from 'codehike/code';

export const PreWithFocus: AnnotationHandler['PreWithRef'] = (props) => {
  const ref = getPreRef(props);
  useScrollToFocus(ref);
  return <InnerPre merge={props} />;
};

function useScrollToFocus(ref: React.RefObject<HTMLPreElement | null>) {
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const focused =
      ref.current.querySelectorAll<HTMLElement>('[data-focus=true]');
    const containerRect = ref.current.getBoundingClientRect();
    let top = Infinity;
    let bottom = -Infinity;
    focused.forEach((el) => {
      const rect = el.getBoundingClientRect();
      top = Math.min(top, rect.top - containerRect.top);
      bottom = Math.max(bottom, rect.bottom - containerRect.top);
    });
    if (bottom > containerRect.height || top < 0) {
      ref.current.scrollTo({
        top: ref.current.scrollTop + top - 10,
        behavior: firstRender.current ? 'instant' : 'smooth'
      });
    }
    firstRender.current = false;
  }, [ref]);
}
