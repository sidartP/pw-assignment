import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class CatalogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openHome() {
    await this.page.goto('/');
  }

  async openCategory(categoryName: string) {
    await this.page.getByRole('link', { name: categoryName, exact: true }).first().click();
    await expect(
      this.page.getByRole('heading', { name: categoryName, exact: true }),
      `Category heading for ${categoryName} should become visible`,
    ).toBeVisible();
  }

  async addProductToCart(productName: string) {
    const productCard = this.page.locator('.product-item').filter({
      hasText: productName,
    }).first();

    await expect(
      productCard,
      `Product card for ${productName} should be visible`,
    ).toBeVisible();

    await productCard.getByRole('button', { name: 'Add to cart', exact: true }).click();
    const notification = this.page.locator('#bar-notification.success');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('The product has been added to your shopping cart');
    await this.dismissSuccessNotification();
  }
}
