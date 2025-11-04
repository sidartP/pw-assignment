import { expect, Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/cart');
  }

  async expectCartQuantity(expected: number) {
    const visibleQty = await this.page.locator('.cart-qty').innerText();
    const numericQuantity = Number(visibleQty.replace(/[()]/g, ''));

    expect(numericQuantity, 'Cart quantity should match number of added products').toBe(
      expected,
    );

    const cartRows = this.page.locator('table.cart tbody tr');
    await expect(cartRows).toHaveCount(expected);
  }

  async expectProductsInCart(productNames: string[]) {
    for (const productName of productNames) {
      const productRow = this.page
        .locator('table.cart tbody tr')
        .filter({
          has: this.page.locator('a', { hasText: productName }),
        });

      await expect(productRow, `Product ${productName} should exist in cart`).toHaveCount(1);

      const quantityInput = productRow.locator('input.qty-input');
      await expect(quantityInput).toHaveValue('1');
    }
  }

  async proceedToCheckout() {
    await this.page.locator('#termsofservice').check();
    await this.page.locator('#checkout').click();
  }
}
