const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

function readJavaFile(file) {
    return fs.readFileSync(file, 'utf8');
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toTsClassName(javaName) {
    return javaName.replace(/\.java$/, '') + '';
}

function guessSelector(arg) {
    // arg is like By.id("username") or By.xpath("//...")
    if (!arg) return null;
    const m = arg.match(/By\.id\s*\(\s*"([^"]+)"\s*\)/);
    if (m) return `#${m[1]}`;
    const m2 = arg.match(/By\.name\s*\(\s*"([^"]+)"\s*\)/);
    if (m2) return `[name=\"${m2[1]}\"]`;
    const m3 = arg.match(/By\.className\s*\(\s*"([^"]+)"\s*\)/);
    if (m3) return `.${m3[1]}`;
    const m4 = arg.match(/By\.cssSelector\s*\(\s*"([^"]+)"\s*\)/);
    if (m4) return `${m4[1]}`;
    const m5 = arg.match(/By\.xpath\s*\(\s*"([^"]+)"\s*\)/);
    if (m5) return `xpath=${m5[1]}`;
    // fallback: try string literal
    const m6 = arg.match(/"([^"]+)"/);
    if (m6) return m6[1];
    return null;
}

function convertPage(javaPath, outDir) {
    const content = readJavaFile(javaPath);
    const fileName = path.basename(javaPath).replace('.java', '');
    const classMatch = content.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : fileName;

    // find WebElement declarations like WebElement username = driver.findElement(By.id("username"));
    // or By locators stored in By objects: private By username = By.id("username");
    const locators = {}; // name -> selector

    // pattern: By id/name/className/cssSelector/xpath
    const byPattern = /By\.\w+\s*\(\s*"[^"]+"\s*\)/g;

    // find lines with By.x(...) assigned to By variables
    const byVarPattern = /By\s+(\w+)\s*=\s*(By\.\w+\s*\(\s*"[^"]+"\s*\))\s*;/g;
    let m;
    while ((m = byVarPattern.exec(content)) !== null) {
        const name = m[1];
        const arg = m[2];
        const sel = guessSelector(arg);
        if (sel) locators[name] = sel;
    }

    // find WebElement fields: WebElement username = driver.findElement(By.id("username"));
    const webElPattern = /WebElement\s+(\w+)\s*=\s*driver\.findElement\s*\(\s*(By\.\w+\s*\(\s*"[^"]+"\s*\))\s*\)\s*;/g;
    while ((m = webElPattern.exec(content)) !== null) {
        const name = m[1];
        const arg = m[2];
        const sel = guessSelector(arg);
        if (sel) locators[name] = sel;
    }

    // find methods and map actions inside
    const methodPattern = /public\s+(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)^\s*\}/gm;
    const methods = [];
    while ((m = methodPattern.exec(content)) !== null) {
        const name = m[1];
        const params = m[2].trim();
        const body = m[3];
        methods.push({ name, params, body });
    }

    // build ts file
    let ts = `import { Page } from 'playwright';\n\nexport class ${className} {\n  constructor(private page: Page) {}\n\n`;

    // create helper locators
    Object.keys(locators).forEach((k) => {
        const sel = locators[k];
        ts += `  ${k}(selector = '${sel}') { return this.page.locator(selector); }\n`;
    });

    // convert methods heuristically
    methods.forEach((mth) => {
        const name = mth.name;
        const params = mth.params;
        const paramsList = params ? params.split(',').map(p => p.trim().split(' ').pop()).filter(Boolean).join(', ') : '';
        let methodBody = '    // Auto-converted from Java; review selector usages and waits\n';
        const lines = mth.body.split('\n');
        lines.forEach((ln) => {
            ln = ln.trim();
            // driver.findElement(By.id("...")).sendKeys("x");
            let send = ln.match(/driver\.findElement\s*\(\s*(By\.\w+\s*\(\s*"([^"]+)"\s*\))\s*\)\.sendKeys\s*\(\s*"([^"]*)"\s*\)\s*;/);
            if (send) {
                const sel = guessSelector(send[1]);
                methodBody += `    await this.page.fill('${sel}', '${send[3]}');\n`;
                return;
            }
            let click = ln.match(/driver\.findElement\s*\(\s*(By\.\w+\s*\(\s*"([^"]+)"\s*\))\s*\)\.click\s*\(\s*\)\s*;/);
            if (click) {
                const sel = guessSelector(click[1]);
                methodBody += `    await this.page.click('${sel}');\n`;
                return;
            }
            // e.g., username.sendKeys("x"); where username is WebElement field
            let fieldSend = ln.match(/(\w+)\.sendKeys\s*\(\s*"([^"]*)"\s*\)\s*;/);
            if (fieldSend && locators[fieldSend[1]]) {
                methodBody += `    await this.page.fill('${locators[fieldSend[1]]}', '${fieldSend[2]}');\n`;
                return;
            }
            let fieldClick = ln.match(/(\w+)\.click\s*\(\s*\)\s*;/);
            if (fieldClick && locators[fieldClick[1]]) {
                methodBody += `    await this.page.click('${locators[fieldClick[1]]}');\n`;
                return;
            }
            // return text
            let getText = ln.match(/return\s+(\w+)\.getText\s*\(\s*\)\s*;/);
            if (getText && locators[getText[1]]) {
                methodBody += `    return await this.page.textContent('${locators[getText[1]]}');\n`;
                return;
            }
        });

        ts += `  async ${name}(${paramsList}) {\n${methodBody}  }\n\n`;
    });

    ts += `}\n`;

    ensureDir(outDir);
    const outPath = path.join(outDir, `${className}.ts`);
    fs.writeFileSync(outPath, ts, 'utf8');
    return outPath;
}

function convertTest(javaPath, outDir, pagesDir) {
    const content = readJavaFile(javaPath);
    const fileName = path.basename(javaPath).replace('.java', '');
    const classMatch = content.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : fileName;

    // find @Test methods
    const testPattern = /@Test[\s\S]*?public\s+void\s+(\w+)\s*\(\s*\)\s*\{([\s\S]*?)^\s*\}/gm;
    const tests = [];
    let m;
    while ((m = testPattern.exec(content)) !== null) {
        tests.push({ name: m[1], body: m[2] });
    }

    // Create TS test file that launches Playwright and calls page methods heuristically
    let ts = `import { chromium } from 'playwright';\n`;

    // attempt to detect page classes used by name from imports
    const importPattern = /import\s+com\.crm\.qa\.pages\.(\w+)\s*;/g;
    const imports = [];
    while ((m = importPattern.exec(content)) !== null) {
        imports.push(m[1]);
    }

    imports.forEach((imp) => {
        ts += `import { ${imp} } from '../pages/${imp}';\n`;
    });

    ts += `\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n`;

    // instantiate pages
    imports.forEach((imp) => {
        const varName = imp[0].toLowerCase() + imp.slice(1);
        ts += `  const ${varName} = new ${imp}(page);\n`;
    });

    ts += `\n  try {\n`;

    tests.forEach((t) => {
        ts += `    // Test: ${t.name}\n`;
        const lines = t.body.split('\n');
        lines.forEach((ln) => {
            ln = ln.trim();
            // detect page.method() calls like loginPage.login(prop, prop);
            const pageCall = ln.match(/(\w+)\.(\w+)\s*\(([^;]*)\)\s*;/);
            if (pageCall) {
                const obj = pageCall[1];
                const method = pageCall[2];
                const args = pageCall[3].trim();
                const jsArgs = args.replace(/new\s+\w+\s*\(|\)/g, '').replace(/"/g, "'");
                // map to await obj.method(args)
                ts += `    await ${obj}.${method}(${jsArgs});\n`;
            }
            // detect driver.get("url")
            const goto = ln.match(/driver\.get\s*\(\s*"([^"]+)"\s*\)\s*;/);
            if (goto) {
                ts += `    await page.goto('${goto[1]}');\n`;
            }
        });

        ts += `\n`;
    });

    ts += `    console.log('Converted test executed (you must review and run it manually).');\n`;
    ts += `  } catch (err) { console.error(err); } finally { await browser.close(); }\n})();\n`;

    ensureDir(outDir);
    const outPath = path.join(outDir, `${className}.ts`);
    fs.writeFileSync(outPath, ts, 'utf8');
    return outPath;
}

// Main
const repoRoot = path.resolve(__dirname, '..', '..');
const javaPagesDir = path.join(repoRoot, 'src', 'main', 'java');
const javaTestsDir = path.join(repoRoot, 'src', 'test', 'java');

const convertedRoot = path.join(repoRoot, 'playwrite', 'converted');
const convPages = path.join(convertedRoot, 'pages');
const convTests = path.join(convertedRoot, 'tests');
ensureDir(convertedRoot);
ensureDir(convPages);
ensureDir(convTests);

let converted = [];

if (fs.existsSync(javaPagesDir)) {
    const allFiles = walk(javaPagesDir);
    const pageFiles = allFiles.filter(f => f.endsWith('.java') && f.includes(path.join('com', 'crm', 'qa', 'pages')));
    pageFiles.forEach(p => {
        try {
            const out = convertPage(p, convPages);
            converted.push({ input: p, output: out });
        } catch (e) {
            console.error('Failed converting page', p, e.message);
        }
    });
}

if (fs.existsSync(javaTestsDir)) {
    const allFiles = walk(javaTestsDir);
    const testFiles = allFiles.filter(f => f.endsWith('.java') && f.includes(path.join('com', 'crm', 'qa', 'testcases')));
    testFiles.forEach(p => {
        try {
            const out = convertTest(p, convTests, convPages);
            converted.push({ input: p, output: out });
        } catch (e) {
            console.error('Failed converting test', p, e.message);
        }
    });
}

console.log('Conversion complete. Files converted:');
converted.forEach(c => console.log(`- ${c.input} -> ${c.output}`));

if (converted.length === 0) console.log('No matching Java page/test files found for conversion.');