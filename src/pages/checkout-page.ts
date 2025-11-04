import { expect, Locator, Page } from '@playwright/test';

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  address1: string;
  zip: string;
  phone: string;
};

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async completeCheckout(address: CheckoutAddress) {
    await this.page.waitForURL(/\/checkout/);

    await this.fillBillingAddress(address);
    await this.advanceStep('#billing-buttons-container .button-1');

    const shippingStep = this.page.locator('#checkout-step-shipping');
    if (await shippingStep.isVisible()) {
      await this.ensureShippingAddress(address);
      await this.advanceStep('#shipping-buttons-container .button-1');
    }

    await this.chooseFirstOptionIfAvailable('input[name="shippingoption"]');
    await this.advanceStep('#shipping-method-buttons-container .button-1');

    await this.chooseFirstOptionIfAvailable('input[name="paymentmethod"]');
    await this.advanceStep('#payment-method-buttons-container .button-1');

    await this.advanceStep('#payment-info-buttons-container .button-1');

    await this.advanceStep('#confirm-order-buttons-container .button-1');

    const confirmation = this.page.locator('.section.order-completed');
    await expect(confirmation).toContainText(
      'Your order has been successfully processed!',
    );
  }

  private async fillBillingAddress(address: CheckoutAddress) {
    const newAddressSelect = this.page.locator('#billing-address-select');
    if ((await newAddressSelect.count()) > 0) {
      const optionLabels = await newAddressSelect.locator('option').allTextContents();
      if (optionLabels.some((text) => text.includes('New Address'))) {
        await newAddressSelect.selectOption({ label: 'New Address' });
      }
    }

    await this.fillAddressForm('BillingNewAddress', address);
  }

  private async ensureShippingAddress(address: CheckoutAddress) {
    const shippingSelect = this.page.locator('#shipping-address-select');
    if ((await shippingSelect.count()) > 0) {
      const optionLabels = await shippingSelect.locator('option').allTextContents();
      if (optionLabels.some((text) => text.includes('New Address'))) {
        await shippingSelect.selectOption({ label: 'New Address' });
      }
    }

    const shippingFirstName = this.page.locator('#ShippingNewAddress_FirstName');
    if ((await shippingFirstName.count()) > 0) {
      await this.fillAddressForm('ShippingNewAddress', address);
    }
  }

  private async fillAddressForm(prefix: string, address: CheckoutAddress) {
    const firstName = this.page.locator(`#${prefix}_FirstName`);
    if ((await firstName.count()) === 0) {
      return;
    }

    await firstName.fill(address.firstName);
    await this.page.locator(`#${prefix}_LastName`).fill(address.lastName);

    const emailField = this.page.locator(`#${prefix}_Email`);
    if ((await emailField.count()) > 0) {
      await emailField.fill(address.email);
    }

    await this.selectIfPresent(`#${prefix}_CountryId`, address.country);
    await this.page.locator(`#${prefix}_City`).fill(address.city);
    await this.page.locator(`#${prefix}_Address1`).fill(address.address1);
    await this.page.locator(`#${prefix}_ZipPostalCode`).fill(address.zip);
    await this.page.locator(`#${prefix}_PhoneNumber`).fill(address.phone);
  }

  private async selectIfPresent(selector: string, label: string) {
    const selectControl = this.page.locator(selector);
    if ((await selectControl.count()) > 0) {
      await selectControl.selectOption({ label });
    }
  }

  private async chooseFirstOptionIfAvailable(selector: string) {
    const options = this.page.locator(selector);
    if ((await options.count()) > 0) {
      await options.first().check();
    }
  }

  private async advanceStep(buttonSelector: string) {
    const buttons = this.page.locator(buttonSelector);
    if ((await buttons.count()) === 0) {
      return;
    }

    const button = buttons.first();
    await expect(button).toBeEnabled();
    await button.click();
  }
}
