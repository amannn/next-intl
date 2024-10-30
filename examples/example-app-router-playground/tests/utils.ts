import {APIResponse, Page, expect} from '@playwright/test';

export async function getAlternateLinks(response: APIResponse) {
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

export async function assertLocaleCookieValue(
  page: Page,
  value?: string,
  otherProps?: Record<string, unknown>
) {
  const cookie = (await page.context().cookies()).find(
    (cur) => cur.name === 'NEXT_LOCALE'
  );
  if (value) {
    expect(cookie).toMatchObject({
      name: 'NEXT_LOCALE',
      value,
      ...otherProps
    });
  } else {
    expect(cookie).toBeUndefined();
  }
}
