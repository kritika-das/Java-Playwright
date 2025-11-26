import { chromium } from 'playwright';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000'); // TODO: Set correct URL
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  try {
    // @Test: loginPageTitleTest
    await loginPage.validateLoginPageTitle();

    // @Test: crmLogoImageTest
    await loginPage.validateCRMImage();

    // @Test: loginTest
    await loginPage.login('username', 'password');

    console.log('All tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
