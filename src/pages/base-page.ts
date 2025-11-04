import { expect, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async waitForAjaxComplete() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  protected async dismissSuccessNotification() {
    const notification = this.page.locator('#bar-notification.success');
    if (await notification.isVisible()) {
      await expect(notification, 'Success notification should be visible').toBeVisible();
      await notification.locator('.close').click();
      await expect(notification).toBeHidden();
    }
  }
}
