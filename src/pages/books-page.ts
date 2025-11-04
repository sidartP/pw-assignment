import { expect, Page } from '@playwright/test';

export class BooksPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/books');
  }

  async addProductToCart(productName: string) {
    const productCard = this.page
      .locator('.product-item')
      .filter({
        has: this.page.locator('.product-title a', { hasText: productName }),
      });

    await expect(productCard, `Product ${productName} should be visible`).toBeVisible();
    await productCard.locator('input[value="Add to cart"]').click();

    const notification = this.page.locator('#bar-notification.success');
    await expect(notification).toBeVisible();
    await expect(notification.locator('p')).toContainText(
      'The product has been added to your shopping cart',
    );
    await notification.locator('span.close').click();
    await expect(notification).toBeHidden();
  }
}
