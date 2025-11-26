import { chromium } from 'playwright';
import { TestAgent } from '../agent/testAgent';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const agent = new TestAgent(browser, page);

  try {
    await page.goto('https://example.com/product/1');
    await agent.run('add to cart');
    await agent.run('proceed to checkout');
    await agent.run('place order');
    console.log('Action log:', agent.getLog());
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
