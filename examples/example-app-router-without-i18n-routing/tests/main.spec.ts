import {Page, test as it} from '@playwright/test';

async function submitLoginForm(page: Page, password: string) {
  await page.getByRole('textbox', {name: 'Email'}).fill('jane@doe.com');
  await page.getByRole('textbox', {name: 'Password'}).fill(password);
  await page.getByRole('textbox', {name: 'Password'}).press('Enter');
}

it('shows localized server errors in the login form', async ({page}) => {
  await page.goto('/login');
  await submitLoginForm(page, 'invalid');
  await page.getByText('Please check your credentials.').isVisible();

  await page
    .getByRole('combobox', {name: 'Language'})
    .selectOption({label: 'Deutsch'});
  await submitLoginForm(page, 'invalid');
  await page.getByText('Bitte überprüfen Sie Ihre Anmeldedaten.').isVisible();
});

it('can login and switch the language', async ({page}) => {
  await page.goto('/login');
  await submitLoginForm(page, 'password');
  await page.getByRole('heading', {name: 'Start'}).isVisible();
  await page
    .getByRole('combobox', {name: 'Language'})
    .selectOption({label: 'English'});
  await page.getByRole('heading', {name: 'Home'}).isVisible();
});
