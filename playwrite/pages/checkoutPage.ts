import { Page } from 'playwright';

export class CheckoutPage {
  constructor(private page: Page) {}

  async addToCart() {
    await this.page.click('button.add-to-cart');
    return 'added to cart';
  }

  async proceedToCheckout() {
    await this.page.click('a[href*="checkout"]');
    return 'proceeded to checkout';
  }

  async placeOrder() {
    await this.page.click('button.place-order');
    return 'placed order';
  }
}
