import { chromium, Browser, Page } from 'playwright';
import { TestAgent } from '../agent/testAgent';

export async function createAgent() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  const agent = new TestAgent(browser, page as unknown as Page);
  return { browser, page, agent };
}
