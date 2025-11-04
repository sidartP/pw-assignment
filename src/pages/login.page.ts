import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    const emailField = this.page.getByLabel('Email:');
    const passwordField = this.page.getByLabel('Password:');
    const loginButton = this.page.getByRole('button', { name: 'Log in' });

    await emailField.fill(email);
    await passwordField.fill(password);
    await loginButton.click();

    await expect(this.page.getByRole('link', { name: 'Log out' })).toBeVisible({
      timeout: 15_000,
    });
  }
}
