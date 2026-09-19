import { expect, Locator, Page } from '@playwright/test';
import { loginUrl } from '../utils/loginDetails';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  
  constructor(page: Page) {
    this.page = page;
    this.username = page.locator("#username");
    this.password = page.locator("#password");
    this.loginButton = page.locator("#kc-login");
  }

  async gotoLoginPage() {
    await this.page.goto(loginUrl);
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
    console.log('Successfully logged into adeahub');
  }

  async verifyLoginSuccess() {
    await expect(this.page).toHaveURL(/provider/);
   
  }
}