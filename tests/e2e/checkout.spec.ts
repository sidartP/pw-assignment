import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { CatalogPage } from '../../src/pages/catalog.page';
import { CartPage } from '../../src/pages/cart.page';
import { CheckoutPage, CheckoutAddress } from '../../src/pages/checkout.page';

const credentials = {
  email: process.env.DEMO_WEB_SHOP_EMAIL ?? 'test11nov@test.com',
  password: process.env.DEMO_WEB_SHOP_PASSWORD ?? '123456',
};

const products = [
  { category: 'Books', name: 'Computing and Internet' },
  { category: 'Books', name: 'Fiction' },
];

const address: CheckoutAddress = {
  firstName: 'QA',
  lastName: 'Engineer',
  email: credentials.email,
  country: 'United States',
  city: 'New York',
  address1: '123 Automation Way',
  postalCode: '10001',
  phoneNumber: '1234567890',
};

test.describe('Demo Web Shop checkout', () => {
  test('allows a logged-in user to complete a purchase', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);

    await catalogPage.openHome();

    for (const product of products) {
      await catalogPage.openCategory(product.category);
      await catalogPage.addProductToCart(product.name);
    }

    await cartPage.open();
    await cartPage.assertCartQuantity(products.length);
    await cartPage.assertProductsInCart(products.map((p) => p.name));
    await cartPage.checkout();

    await checkoutPage.fillBillingAddress(address);
    await checkoutPage.fillShippingAddressIfRequested(address);
    await checkoutPage.chooseShippingMethod();
    await checkoutPage.choosePaymentMethod();
    await checkoutPage.confirmPaymentInformation();
    await checkoutPage.confirmOrder();
    await checkoutPage.assertOrderSuccess();
  });
});
