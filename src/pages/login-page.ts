import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('#Email', email);
    await this.page.fill('#Password', password);
    await this.page.click('input.button-1.login-button');

    const accountLink = this.page.locator('a.account');
    await expect(accountLink).toHaveText(email, {
      message: 'Logged in account email should match the supplied credentials',
    });
  }
}
