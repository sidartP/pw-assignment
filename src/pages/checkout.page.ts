import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  address1: string;
  postalCode: string;
  phoneNumber: string;
};

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillBillingAddress(address: CheckoutAddress) {
    // When the dropdown exists, the default selection is kept and we simply continue.

    await this.continueFrom('#billing-buttons-container');
  }

  async fillShippingAddressIfRequested(address: CheckoutAddress) {
    await this.continueFrom('#shipping-buttons-container');
  }

  async chooseShippingMethod() {
    const shippingOptions = this.page.locator('input[name="shippingoption"]');
    if (await shippingOptions.count()) {
      if (!(await shippingOptions.first().isChecked())) {
        await shippingOptions.first().check();
      }
    }
    await this.continueFrom('#shipping-method-buttons-container');
  }

  async choosePaymentMethod() {
    await this.continueFrom('#payment-method-buttons-container');
  }

  async confirmPaymentInformation() {
    await this.continueFrom('#payment-info-buttons-container');
  }

  async confirmOrder() {
    await this.page
      .locator('#confirm-order-buttons-container .button-1.confirm-order-next-step-button, #confirm-order-buttons-container input.button-1')
      .first()
      .click();
    await this.waitForAjaxComplete();
    await expect(this.page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
  }

  async assertOrderSuccess() {
    await expect(this.page.getByText('Your order has been successfully processed!')).toBeVisible();
  }

  private async continueFrom(containerSelector: string) {
    const container = this.page.locator(containerSelector);
    const button = container.locator('button:has-text("Continue"), input.button-1');
    await expect(button.first()).toBeVisible({ timeout: 10_000 });
    await button.first().click();
    await this.waitForAjaxComplete();
  }
}
