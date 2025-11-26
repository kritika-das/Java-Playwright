import { chromium } from 'playwright';
import { ContactsPage } from '../pages/ContactsPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

(async () => {
  const HEADLESS = (process.env.HEADLESS || 'false') !== 'false' ? true : (process.env.HEADLESS === 'true');
  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage();
  const BASE_URL = process.env.BASE_URL || 'https://www.freecrm.com';
  await page.goto(BASE_URL);
  const contactsPage = new ContactsPage(page);
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  try {
    // @Test: verifyHomePageTitleTest
    await homePage.verifyHomePageTitle();

    // @Test: verifyUserNameTest

    // @Test: verifyContactsLinkTest
    await homePage.clickOnContactsLink();

    console.log('All tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
