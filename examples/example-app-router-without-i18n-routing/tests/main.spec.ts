import {test as it} from '@playwright/test';

it('uses the provided locale', async ({page}) => {
  await page.goto('/');
  page.getByRole('heading', {name: 'Home'});

  await page.goto('/');
  page.getByRole('heading', {name: 'About'});
});
