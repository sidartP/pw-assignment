import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.page.goto('/cart');
    await expect(this.page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
  }

  async assertCartQuantity(expectedCount: number) {
    await expect(this.page.locator('.cart-qty')).toHaveText(`(${expectedCount})`);
    await expect(this.page.locator('table.cart')).toBeVisible();
  }

  async assertProductsInCart(productNames: string[]) {
    for (const name of productNames) {
      const row = this.page
        .locator('table.cart')
        .locator('tbody tr')
        .filter({ hasText: name });
      await expect(row, `Cart should contain product ${name}`).toBeVisible();
    }
  }

  async checkout() {
    const termsCheckbox = this.page.getByLabel('I agree with the terms of service and I adhere to them unconditionally');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    } else {
      await this.page.locator('#termsofservice').check();
    }

    await this.page.getByRole('button', { name: 'Checkout' }).click();
    await expect(this.page).toHaveURL(/checkout/);
  }
}
