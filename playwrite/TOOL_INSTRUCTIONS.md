# Tool Instructions — Playwright Agent Scaffold

This file explains how to use the Java→Playwright converter, how to run the converted tests, and how to troubleshoot common issues.

## Location
- Converter script: `tools/javaToPlaywright.cjs`
- Converted output: `converted/pages/` and `converted/tests/`
- Test runner: `runTests.cjs`
- This instruction file: `TOOL_INSTRUCTIONS.md`

## Quick Setup
1. Install dependencies:
```powershell
cd "c:\Users\kriti\Downloads\JavatoPlaywrite\PageObjectModel\playwrite"
npm install
```

2. Install Playwright browsers (Chromium/Firefox/WebKit):
```powershell
npx playwright install
```

## Convert Java → Playwright
Run the converter to generate/refresh TypeScript page objects and tests from Java sources.
```powershell
# from playwrite/ folder
npm run convert
# or directly
node tools/javaToPlaywright.cjs
```
Outputs appear under `playwrite/converted/`.

## Running Tests
- Run a single converted test (example: Login):
```powershell
npm run test:login
```
- Run all converted tests (sequential):
```powershell
npm run test:all
```
- You can also run a test directly with `ts-node` (from `playwrite/`):
```powershell
npx ts-node converted/tests/LoginPageTest.ts
```

Notes:
- Tests use `ts-node` to execute `.ts` files at runtime.
- `tsconfig.json` is configured to support `ts-node` (CommonJS module).

## Editing Test Configuration
- Test URL is taken from converted test files; update `converted/tests/*` to the correct application URL (e.g. `https://www.freecrm.com`).
- Credentials in original Java project live in `src/main/java/com/crm/qa/config/config.properties`. You can replicate those values in environment variables or edit tests to read a local config.

## Common Problems & Fixes
- ERROR: `Unknown file extension ".ts"`
  - Cause: Node running with ESM mode or `ts-node` not configured.
  - Fixes:
    - Ensure `tsconfig.json` module is `commonjs` and `ts-node` settings exist.
    - Remove `"type": "module"` from `package.json` if present.
    - Run tests via `npx ts-node <file>` from project root.

- ERROR: `Executable doesn't exist` or Playwright prompts to run `npx playwright install`
  - Cause: Playwright browsers not installed or the download was interrupted.
  - Fix:
    - Run `npx playwright install` and ensure the download completes.

- TIMEOUTS / `page.fill` / `locator` not found
  - Cause: Page layout changed, redirect to another host (e.g., `https://ui.freecrm.com/`), form inside an iframe, or the selector is stale.
  - Fixes:
    - Add debug logging in the test to print `await page.title()` and `page.url()` after `goto()`.
    - Inspect frames with `const frames = page.frames(); console.log(frames.length)` and check frame contents.
    - Use `await page.waitForSelector('[name="username"]', { timeout: 60000 })` before `fill()`.
    - If elements are in a frame, use `const frame = page.frame({ name: 'frameName' })` or locate the correct frame by content.

- `ts-node` flag issues
  - Older `ts-node` versions do not accept some CLI flags. Use the `ts-node` version in `devDependencies` or invoke via `npx ts-node <file>`.

## Debugging Tips
- Open the test with `headless: false` to visually observe the browser:
  - Converted tests already set `headless: false` for most tests.
- Add short pauses or screenshots:
```typescript
await page.screenshot({ path: 'debug.png' });
await page.waitForTimeout(2000);
```
- Log selectors and existence checks:
```typescript
console.log('Current URL', page.url());
console.log('Username exists:', await page.$('[name="username"]') !== null);
```

## Extending the Converter
- The converter is a heuristic tool — manual review is expected.
- To re-run conversion after updating Java sources:
  - Ensure Java sources are in the repository under `src/main/java` and `src/test/java` paths the converter expects.
  - Run `npm run convert`.

## Suggested Next Steps
- Add a small configuration file (e.g. `playwrite/config/test.env` or `playwrite/.env`) and update converted tests to read URL/credentials from it.
- Add Playwright assertions (expect) to converted tests to replace Java `Assert.*` calls.
- Improve wait strategies and frame handling in `converted/pages/*` where needed.

## File locations quick reference
- `playwrite/tools/javaToPlaywright.cjs` — converter
- `playwrite/converted/pages/*` — generated page objects
- `playwrite/converted/tests/*` — generated tests
- `playwrite/runTests.cjs` — test runner
- `playwrite/package.json` — npm scripts
- `playwrite/tsconfig.json` — TypeScript configuration for `ts-node`

If you want, I can:
- Add a `.env` config loader to the converted tests and wire them to `config.properties` values,
- Add debug logging to the failing login test to detect frames and selectors,
- Or update the converted `LoginPage` to wait for and handle frames automatically.

