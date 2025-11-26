# Java ↔ Playwright Conversion Examples

## Example 1: Page Object - Login Page

### Java Selenium Input
```java
package com.crm.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    WebDriver driver;

    @FindBy(name = "username")
    WebElement username;

    @FindBy(name = "password")
    WebElement password;

    @FindBy(xpath = "//input[@type='submit']")
    WebElement loginButton;

    @FindBy(xpath = "//img[contains(@class,'img-responsive')]")
    WebElement crmLogo;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public String validateLoginPageTitle() {
        return driver.getTitle();
    }

    public boolean validateCRMImage() {
        return crmLogo.isDisplayed();
    }

    public void login(String un, String pwd) {
        username.sendKeys(un);
        password.sendKeys(pwd);
        loginButton.click();
    }
}
```

### Playwright TypeScript Output
```typescript
import { Page } from 'playwright';

export class LoginPage {
  constructor(private page: Page) {}

  async validateLoginPageTitle() {
    return await this.page.title();
  }

  async validateCRMImage() {
    return await this.page.isVisible(`xpath=//img[contains(@class,\'img-responsive\')]`);
  }

  async login(un, pwd) {
    await this.page.fill('[name="username"]', un);
    await this.page.fill('[name="password"]', pwd);
    await this.page.click(`xpath=//input[@type=\'submit\']`);
  }
}
```

---

## Example 2: Test Class

### Java Selenium Input
```java
package com.crm.qa.testcases;

import com.crm.qa.base.TestBase;
import com.crm.qa.pages.HomePage;
import com.crm.qa.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class LoginPageTest extends TestBase {
    LoginPage loginPage;
    HomePage homePage;

    @BeforeMethod
    public void setUp() {
        initialization();
        loginPage = new LoginPage(driver);
    }

    @Test(priority = 1)
    public void loginPageTitleTest() {
        String title = driver.getTitle();
        Assert.assertEquals(title, "#1 Free CRM for Any Business: Online Customer Relationship Software");
    }

    @Test(priority = 2)
    public void crmLogoImageTest() {
        boolean flag = loginPage.validateCRMImage();
        Assert.assertTrue(flag);
    }

    @Test(priority = 3)
    public void loginTest() {
        homePage = loginPage.login(prop.getProperty("username"), prop.getProperty("password"));
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}
```

### Playwright TypeScript Output
```typescript
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
    const title = await page.title();
    // TODO: Add assertion - verify title matches expected value

    // @Test: crmLogoImageTest
    await loginPage.validateCRMImage();
    // TODO: Add assertion - verify logo is visible

    // @Test: loginTest
    await loginPage.login('username', 'password');

    console.log('All tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
```

---

## Conversion Mapping Reference

### Locator Conversions

| Java Pattern | Playwright Output |
|---|---|
| `@FindBy(id="myId")` | `page.locator('#myId')` |
| `@FindBy(name="myName")` | `page.locator('[name="myName"]')` |
| `@FindBy(className="myClass")` | `page.locator('.myClass')` |
| `@FindBy(xpath="//path")` | `page.locator('xpath=//path')` |
| `@FindBy(css="div.class")` | `page.locator('div.class')` |

### Method Conversions

| Java Method | Playwright Method | Notes |
|---|---|---|
| `element.sendKeys(text)` | `page.fill(selector, text)` | Fills text into field |
| `element.click()` | `page.click(selector)` | Clicks element |
| `element.isDisplayed()` | `page.isVisible(selector)` | Checks visibility |
| `element.getText()` | `page.textContent(selector)` | Gets element text |
| `driver.getTitle()` | `page.title()` | Gets page title |
| `driver.getCurrentUrl()` | `page.url()` | Gets current URL |
| `driver.get(url)` | `page.goto(url)` | Navigates to URL |
| `driver.refresh()` | `page.reload()` | Refreshes page |
| `element.clear()` | `page.fill(selector, '')` | Clears field |

---

## Tips for Testing Converted Code

### 1. Enable Visual Mode (Headless=False)
```typescript
const browser = await chromium.launch({ headless: false });
```
Allows you to see the browser during test execution.

### 2. Add Wait for Element
```typescript
await page.waitForSelector('[name="username"]');
await loginPage.login('user', 'pass');
```

### 3. Add Debugging
```typescript
console.log('About to login...');
await loginPage.login('user', 'pass');
console.log('Login completed');
```

### 4. Add Assertions
```typescript
const title = await loginPage.validateLoginPageTitle();
if (title !== "Expected Title") {
  throw new Error(`Title mismatch: got "${title}"`);
}
```

### 5. Use Playwright Inspector
```powershell
PWDEBUG=1 npx ts-node converted/tests/LoginPageTest.ts
```

---

## Manual Adjustments Needed

After conversion, review and update:

1. **URLs**: Replace `http://localhost:3000` with actual test URL
2. **Timeouts**: Add `page.waitForSelector()` for dynamic elements
3. **Assertions**: Convert Java Assert to Playwright logic
4. **Error Handling**: Add try-catch or expect() statements
5. **Data**: Replace hardcoded values with test data or environment variables

---

## Advanced: Custom Locators

If you need complex locators, use Playwright's locator API:

```typescript
// Exact text match
page.locator('text=Login').click();

// Role-based
page.locator('role=button[name="Submit"]').click();

// Chaining
page.locator('div').filter({ hasText: 'Password' }).locator('input').fill('pass');

// Test ID (recommended)
page.locator('[data-testid="login-btn"]').click();
```

---

## Performance Notes

- Playwright is **faster** than Selenium (headless mode is default)
- XPath can be slower; prefer CSS selectors when possible
- Use `page.goto(url, { waitUntil: 'networkidle' })` for complex pages
- Parallel test execution supported with Worker threads

---

Generated: November 26, 2025  
Based on: Java Selenium → Playwright TypeScript Converter
