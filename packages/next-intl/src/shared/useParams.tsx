import {useParams as useNextParams} from 'next/navigation.js';

export default function useParams() {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  return useNextParams() as ReturnType<typeof useNextParams> | null;
}
