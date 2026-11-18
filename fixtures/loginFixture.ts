import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { username, password } from '../utils/loginDetails';

type TestFixtures = {
  /** Fresh page, logged in before EVERY test. */
  loggedInPage: Page;
  /** The LoginPage object, for tests that need to exercise the login UI itself. */
  loginPage: LoginPage;
};

type WorkerFixtures = {
  /** One page, logged in ONCE per worker and shared by all tests that use it. */
  sharedPage: Page;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  loggedInPage: async ({ page, loginPage }, use) => {
    await loginPage.gotoLoginPage();
    await loginPage.login(username, password);
    await loginPage.verifyLoginSuccess();
    await use(page);
  },

  sharedPage: [
    async ({ browser }, use) => {
      // viewport: null -> follow the (maximized) browser window instead of a fixed size.
      const context = await browser.newContext({ viewport: null });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.gotoLoginPage();
      await login.login(username, password);
      await login.verifyLoginSuccess();
      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
