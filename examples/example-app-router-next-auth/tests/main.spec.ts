import {test as it, expect} from '@playwright/test';

const {beforeEach, describe} = it;

describe('default locale', () => {
  it('allows access to public pages', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    page.getByRole('heading', {name: 'Home'});
    page.getByRole('paragraph', {name: 'You are logged out.'});
  });

  it('prevents access to secret pages', async ({page}) => {
    await page.goto('/secret');
    await expect(page).toHaveURL('/login?callbackUrl=%2Fsecret');
  });

  describe('logged in', () => {
    beforeEach(async ({page}) => {
      await page.goto('/login');
      await page.getByRole('textbox', {name: 'Username'}).type('admin');
      await page.getByRole('textbox', {name: 'Password'}).type('admin');
      await page.getByRole('button', {name: 'Login'}).click();
    });

    it('redirects to the home page', async ({page}) => {
      await expect(page).toHaveURL('/');
      page.getByRole('paragraph', {name: 'Logged in as admin'});
    });

    it('allows access to secret pages', async ({page}) => {
      await page
        .getByRole('link', {name: 'Secret page for logged in users'})
        .click();
      await expect(page).toHaveURL('/secret');
      page.getByRole('heading', {name: 'Secret page'});
      page.getByRole('paragraph', {
        name: 'This page is only visible for logged in users.'
      });
    });

    it('can logout', async ({page}) => {
      await page.getByRole('button', {name: 'Logout'}).click();
      await expect(page).toHaveURL('/');
      page.getByRole('paragraph', {name: 'You are logged out.'});
    });
  });
});

describe('secondary locale', () => {
  it('allows access to public pages', async ({page}) => {
    await page.goto('/de');
    await expect(page).toHaveURL('/de');
    page.getByRole('heading', {name: 'Startseite'});
    page.getByRole('paragraph', {name: 'Du bist abgemeldet.'});
  });

  it('prevents access to secret pages', async ({page}) => {
    await page.goto('/de');
    await page.goto('/de/secret');
    await expect(page).toHaveURL('/de/login?callbackUrl=%2Fde%2Fsecret');
  });

  describe('logged in', () => {
    beforeEach(async ({page}) => {
      await page.goto('/de/login');
      await page.getByRole('textbox', {name: 'Benutzername'}).type('admin');
      await page.getByRole('textbox', {name: 'Passwort'}).type('admin');
      await page.getByRole('button', {name: 'Anmelden'}).click();
    });

    it('redirects to the home page', async ({page}) => {
      await expect(page).toHaveURL('/de');
      page.getByRole('paragraph', {name: 'Angemeldet als admin'});
    });

    it('allows access to secret pages', async ({page}) => {
      await page
        .getByRole('link', {name: 'Geheime Seite für angemeldete Benutzer'})
        .click();
      await expect(page).toHaveURL('/de/secret');
      page.getByRole('heading', {name: 'Geheime Seite'});
      page.getByRole('paragraph', {
        name: 'Diese Seite ist nur für angemeldete Benutzer sichtbar.'
      });
    });

    it('can logout', async ({page}) => {
      await page.getByRole('button', {name: 'Abmelden'}).click();
      await expect(page).toHaveURL('/de');
      page.getByRole('paragraph', {name: 'Du bist abgemeldet.'});
    });
  });
});
