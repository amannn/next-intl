import {APIResponse} from '@playwright/test';

export default async function getAlternateLinks(response: APIResponse) {
  return (
    response
      .headers()
      .link.split(', ')
      // On CI, Playwright uses a different host somehow
      .map((cur) => cur.replace(/0\.0\.0\.0/g, 'localhost'))
      // Normalize ports
      .map((cur) => cur.replace(/localhost:\d{4}/g, 'localhost:3000'))
  );
}
