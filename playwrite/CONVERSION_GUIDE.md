# Java to Playwright Conversion - Quick Start Guide

## What Was Converted

The `javaToPlaywright.cjs` converter automatically transformed Java Selenium tests into Playwright TypeScript:

### Converted Files Location
- **Page Objects**: `playwrite/converted/pages/`
  - LoginPage.ts
  - HomePage.ts
  - ContactsPage.ts
  - DealsPage.ts
  - SignUpPage.ts
  - TasksPage.ts

- **Test Cases**: `playwrite/converted/tests/`
  - LoginPageTest.ts
  - HomePageTest.ts
  - ContactsPageTest.ts

## Conversion Details

### Input Files (Java Selenium)
```
src/main/java/com/crm/qa/pages/LoginPage.java
src/main/java/com/crm/qa/pages/HomePage.java
src/test/java/com/crm/qa/testcases/LoginPageTest.java
... (and others)
```

### Output Files (Playwright TypeScript)
```
playwrite/converted/pages/LoginPage.ts
playwrite/converted/pages/HomePage.ts
playwrite/converted/tests/LoginPageTest.ts
... (and others)
```

## Conversion Mappings

### Java → Playwright Conversions

| Java Selenium | Playwright |
|---|---|
| `@FindBy(name="...")` | `page.locator('[name="..."]')` |
| `@FindBy(xpath="...")` | `page.locator('xpath=...')` |
| `@FindBy(id="...")` | `page.locator('#...')` |
| `element.sendKeys(text)` | `page.fill(selector, text)` |
| `element.click()` | `page.click(selector)` |
| `element.isDisplayed()` | `page.isVisible(selector)` |
| `driver.getTitle()` | `page.title()` |
| `driver.get(url)` | `page.goto(url)` |
| `@Test` methods | `async function` calls |

## Setup & Running Tests

### Prerequisites
- Node.js (v16+)
- npm

### 1. Install Dependencies
```powershell
cd "C:\Users\kriti\Downloads\JavatoPlaywrite\PageObjectModel\playwrite"
npm install
npx playwright install
```

### 2. Update Test Configuration
Edit converted test files to set the correct application URL. Look for:
```typescript
await page.goto('http://localhost:3000'); // TODO: Set correct URL
```

Replace with your actual test URL.

### 3. Run a Converted Test
```powershell
# Navigate to playwrite folder
cd "C:\Users\kriti\Downloads\JavatoPlaywrite\PageObjectModel\playwrite"

# Run with ts-node
npx ts-node converted/tests/LoginPageTest.ts

# Or compile to JavaScript first
npx tsc converted/tests/LoginPageTest.ts --outDir dist
node dist/converted/tests/LoginPageTest.js
```

### 4. Run All Tests Together
Create a test runner (see below) to execute multiple tests in sequence.

## Important Notes

### What Was Automatically Converted
✅ Page locators (@FindBy annotations)  
✅ Basic click, fill, and visibility operations  
✅ Method signatures and parameters  
✅ Test method names  
✅ Browser launch and page navigation  

### What Requires Manual Review
⚠️ XPath selectors with complex expressions (test them in Playwright Inspector)  
⚠️ Assertions (Java Assert statements were removed; add Playwright assertions)  
⚠️ Waits (no explicit waits added; add `page.waitForSelector()` or `page.waitForLoadState()` as needed)  
⚠️ JavaScript executor calls (marked as "review manually")  
⚠️ Custom utility methods (TestBase, TestUtil — not included)  
⚠️ DataProvider-based tests (skipped by default)  

## Example: Converting a Custom Java File

To convert additional Java Selenium files:

1. Add them to the source Java directories:
   - Page objects: `src/main/java/com/crm/qa/pages/`
   - Test classes: `src/test/java/com/crm/qa/testcases/`

2. Re-run the converter:
```powershell
cd "C:\Users\kriti\Downloads\JavatoPlaywrite\PageObjectModel"
node playwrite/tools/javaToPlaywright.cjs
```

New TypeScript files will be generated/overwritten in `playwrite/converted/`.

## Debugging Converted Tests

### Enable Headless=False
In converted test files, change:
```typescript
const browser = await chromium.launch({ headless: true });
```
to:
```typescript
const browser = await chromium.launch({ headless: false });
```

This opens the browser so you can see test execution in real-time.

### Use Playwright Inspector
```powershell
PWDEBUG=1 npx ts-node converted/tests/LoginPageTest.ts
```

### Add Console Logs
Converted test files already have `console.log()` statements. Check PowerShell output for debugging.

## Extending Converted Tests

### Adding Assertions
```typescript
// Example: Add Playwright assertion after method call
const title = await loginPage.validateLoginPageTitle();
if (title !== "#1 Free CRM for Any Business: Online Customer Relationship Software") {
  throw new Error(`Title mismatch: got "${title}"`);
}
```

### Adding Waits
```typescript
await page.waitForSelector('[name="username"]');
await loginPage.login('user', 'pass');
```

### Chaining Operations
```typescript
await loginPage.login('testuser@example.com', 'password');
await homePage.waitForPageLoad();
await homePage.verifyUserName('Test User');
```

## File Structure
```
playwrite/
├── converted/
│   ├── pages/           # Converted page object classes
│   │   ├── LoginPage.ts
│   │   ├── HomePage.ts
│   │   └── ...
│   └── tests/           # Converted test files
│       ├── LoginPageTest.ts
│       ├── HomePageTest.ts
│       └── ...
├── tools/
│   └── javaToPlaywright.cjs  # Converter script
├── package.json         # Dependencies
├── tsconfig.json       # TypeScript config
└── CONVERSION_GUIDE.md # This file
```

## Next Steps

1. **Review all converted files** for correctness and test them.
2. **Add missing assertions** for test validations.
3. **Integrate with CI/CD** for automated testing.
4. **Update selectors** if the UI changes (XPath, CSS selectors may need tuning).
5. **Extend the converter** for custom Java utilities or patterns in your codebase.

## Support & Troubleshooting

### Module Import Errors
If you see "Cannot find module" errors, ensure:
- Dependencies are installed: `npm install`
- You're in the `playwrite` directory when running tests
- TypeScript config (tsconfig.json) is correct

### Selector Not Found Errors
- Use Playwright Inspector (PWDEBUG=1) to inspect selectors
- Verify XPath syntax with Playwright's locator format
- Check if the UI structure matches the Java test assumptions

### Headless Mode Issues
Run tests with `headless: false` to see what's happening and debug interactively.

---

**Generated**: November 26, 2025  
**Converter**: `javaToPlaywright.cjs`  
**Target**: Playwright v1.40+, TypeScript 4.8+
