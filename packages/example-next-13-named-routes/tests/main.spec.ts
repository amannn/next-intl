import {test as it, expect} from '@playwright/test';

it('works for en', async ({page}) => {
  await page.goto('/');

  const link = page.getByRole('link', {name: 'Fender Stratocaster'});
  expect(link).toHaveAttribute('href', '/guitars/fender-stratocaster');
  await link.click();

  await expect(page).toHaveURL('/guitars/fender-stratocaster');
  page.getByRole('heading', {name: 'Fender Stratocaster'});
  page.getByText(
    'The Fender Stratocaster, colloquially known as the Strat, is a model of electric guitar designed in 1952 by Leo Fender, Bill Carson, George Fullerton, and Freddie Tavares. The Fender Musical Instruments Corporation has continuously manufactured the Stratocaster from 1954 to the present. The guitar has been manufactured in Mexico, Japan, and the United States.'
  );
});

it('works for de', async ({page}) => {
  await page.goto('/de');

  const link = page.getByRole('link', {name: 'Fender Stratocaster'});
  expect(link).toHaveAttribute('href', '/de/gitarren/fender-stratocaster');
  await link.click();

  await expect(page).toHaveURL('/de/gitarren/fender-stratocaster');
  page.getByRole('heading', {name: 'Fender Stratocaster'});
  page.getByText(
    'Die Fender Stratocaster, auch bekannt als Strat, ist ein Modell einer E-Gitarre, das 1952 von Leo Fender, Bill Carson, George Fullerton und Freddie Tavares entworfen wurde. Die Fender Musical Instruments Corporation hat die Stratocaster seit 1954 ununterbrochen hergestellt. Die Gitarre wurde in Mexiko, Japan und den Vereinigten Staaten hergestellt.'
  );
});
