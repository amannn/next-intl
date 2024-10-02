import {test as it} from '@playwright/test';

it('shows localized server errors in the login form', async ({page}) => {
  await page.goto('/login');
  await page.getByRole('textbox', {name: 'Email'}).fill('jane@doe.com');
  await page.getByRole('textbox', {name: 'Password'}).fill('invalid');
  await page.getByRole('textbox', {name: 'Password'}).press('Enter');
  await page.getByText('Please check your credentials.').isVisible();

  await page.getByRole('combobox', {name: 'Language'}).click();
  await page.getByRole('option', {name: 'Deutsch'}).click();
  await page.getByRole('textbox', {name: 'Email'}).fill('jane@doe.com');
  await page.getByRole('textbox', {name: 'Passwort'}).fill('invalid');
  await page.getByRole('textbox', {name: 'Passwort'}).press('Enter');
  await page.getByText('Bitte überprüfen Sie Ihre Anmeldedaten.').isVisible();
});

it('can login and switch the language', async ({page}) => {
  await page.goto('/login');
  await page.getByRole('textbox', {name: 'Email'}).fill('jane@doe.com');
  await page.getByRole('textbox', {name: 'Password'}).fill('next-intl');
  await page.getByRole('textbox', {name: 'Password'}).press('Enter');
  await page.getByRole('heading', {name: 'Start'}).isVisible();
  await page.getByRole('combobox', {name: 'Language'}).click();
  await page.getByRole('option', {name: 'English'}).click();
  await page.getByRole('heading', {name: 'Home'}).isVisible();
});
