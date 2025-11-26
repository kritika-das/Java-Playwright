import { chromium } from 'playwright';
import { TestAgent } from '../agent/testAgent';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const agent = new TestAgent(browser, page);

  try {
    await page.goto('https://example.com');
    const res = await agent.run('search "playwright"');
    console.log('Search result:', res);
    console.log('Action log:', agent.getLog());
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
