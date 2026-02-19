import {headers} from 'next/headers.js';
import {cache} from 'react';
import {isPromise} from '../../shared/utils.js';

async function getHeadersImpl(): Promise<Headers> {
  const promiseOrValue = headers();
  return isPromise(promiseOrValue) ? await promiseOrValue : promiseOrValue;
}
const getHeaders = cache(getHeadersImpl);

/**
 * Returns the current pathname from the request. Used for tree-shaking manifest
 * lookup when using messages="infer". Tries x-invoke-path (Next.js internal)
 * and next-url (fallback).
 */
export async function getPathname(): Promise<string | undefined> {
  try {
    const h = await getHeaders();
    const invokePath = h.get('x-invoke-path');
    if (invokePath) return invokePath;

    const nextUrl = h.get('next-url');
    if (nextUrl) {
      try {
        const url = new URL(nextUrl, 'http://localhost');
        return url.pathname;
      } catch {
        return undefined;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}
