import {cookies} from 'next/headers';

// Reads request data and can therefore not be part of
// a prefetched shell, but is streamed in via `Suspense`
export default async function LocaleCookieValue() {
  const value = (await cookies()).get('NEXT_LOCALE')?.value;
  return <p data-testid="LocaleCookieValue">{value || 'none'}</p>;
}
