import { chromium } from 'playwright';
import { TestAgent } from '../agent/testAgent';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const agent = new TestAgent(browser, page);

  // Example usage inside a step definition file
  try {
    await page.goto('https://example.com/login');

    // natural language steps
    await agent.run('enter username "alice"');
    await agent.run('enter password "s3cr3t"');
    const res = await agent.run('click login');
    console.log('Agent result:', res);

    console.log('Action log:', agent.getLog());
  } catch (err) {
    console.error('Step failed:', err);
  } finally {
    await browser.close();
  }
})();
