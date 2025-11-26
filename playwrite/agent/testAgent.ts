import { Browser, Page } from 'playwright';
import { LoginPage } from '../pages/loginPage';
import { SearchPage } from '../pages/searchPage';
import { CheckoutPage } from '../pages/checkoutPage';

export type PageObjects = {
  login: LoginPage;
  search: SearchPage;
  checkout: CheckoutPage;
};

type MappingHandler = (pages: PageObjects, groups: RegExpMatchArray | null, raw: string) => Promise<any>;

export class TestAgent {
  private pages!: PageObjects;
  private mappings: Array<{ re: RegExp; handler: MappingHandler; desc?: string }> = [];
  private log: string[] = [];

  constructor(private browser: Browser, private page: Page) {
    this.pages = {
      login: new LoginPage(page),
      search: new SearchPage(page),
      checkout: new CheckoutPage(page),
    };

    this.registerDefaults();
  }

  // Register a mapping
  registerMapping(re: RegExp, handler: MappingHandler, desc?: string) {
    this.mappings.push({ re, handler, desc });
  }

  // Keyword fallback: try to map a verb + page function by name
  private async fallbackInvoke(raw: string) {
    const text = raw.toLowerCase();
    // look for simple verbs
    const verbMatch = text.match(/\b(click|enter|type|select|add|open|go|search|submit|place|login|logout)\b/);
    const pageMatch = text.match(/\b(login|search|checkout|cart|account)\b/);
    if (!verbMatch || !pageMatch) return null;
    const verb = verbMatch[1];
    const page = pageMatch[1];

    const candidates: Array<{ name: string; fn: Function | undefined }> = [];
    if (page === 'login' || page === 'account') {
      candidates.push({ name: 'clickLogin', fn: (this.pages.login as any).clickLogin });
      candidates.push({ name: 'login', fn: (this.pages.login as any).login });
      candidates.push({ name: 'enterUsername', fn: (this.pages.login as any).enterUsername });
    }
    if (page === 'search') {
      candidates.push({ name: 'enterSearch', fn: (this.pages.search as any).enterSearch });
      candidates.push({ name: 'submitSearch', fn: (this.pages.search as any).submitSearch });
      candidates.push({ name: 'selectResult', fn: (this.pages.search as any).selectResult });
    }
    if (page === 'checkout' || page === 'cart') {
      candidates.push({ name: 'addToCart', fn: (this.pages.checkout as any).addToCart });
      candidates.push({ name: 'proceedToCheckout', fn: (this.pages.checkout as any).proceedToCheckout });
      candidates.push({ name: 'placeOrder', fn: (this.pages.checkout as any).placeOrder });
    }

    // pick first candidate that matches the verb loosely
    for (const c of candidates) {
      if (!c.fn) continue;
      // try to call with no args
      try {
        const res = await (c.fn as any).call((c.fn as any).constructor ? (this.pages as any) : this.pages);
        this.log.push(`fallback: invoked ${c.name} for step "${raw}" -> ${res}`);
        return res;
      } catch (e) {
        // ignore and try next
      }
    }

    return null;
  }

  // Default mapping registrations for common phrases. Extendable by users.
  private registerDefaults() {
    // enter username "alice"
    this.registerMapping(/enter\s+(?:username|user)\s+"([^"]+)"/i, async (pages, groups) => {
      const username = groups![1];
      const res = await pages.login.enterUsername(username);
      return res;
    }, 'Enter username');

    // enter password "secret"
    this.registerMapping(/enter\s+password\s+"([^"]+)"/i, async (pages, groups) => {
      const password = groups![1];
      const res = await pages.login.enterPassword(password);
      return res;
    }, 'Enter password');

    // click login
    this.registerMapping(/click\s+login/i, async (pages) => {
      const res = await pages.login.clickLogin();
      return res;
    }, 'Click login');

    // search for "query"
    this.registerMapping(/search(?:\s+for)?\s+"([^"]+)"/i, async (pages, groups) => {
      const q = groups![1];
      await pages.search.enterSearch(q);
      const res = await pages.search.submitSearch();
      return `${q} -> ${res}`;
    }, 'Search for term');

    // add to cart
    this.registerMapping(/add\s+(?:to\s+)?cart/i, async (pages) => {
      const res = await pages.checkout.addToCart();
      return res;
    }, 'Add to cart');

    // proceed to checkout
    this.registerMapping(/(proceed|go)\s+(?:to\s+)?checkout/i, async (pages) => {
      const res = await pages.checkout.proceedToCheckout();
      return res;
    }, 'Proceed to checkout');

    // place order
    this.registerMapping(/place\s+order/i, async (pages) => {
      const res = await pages.checkout.placeOrder();
      return res;
    }, 'Place order');
  }

  // Run a single natural-language step
  async run(raw: string) {
    // Try mappings
    for (const m of this.mappings) {
      const groups = raw.match(m.re);
      if (groups) {
        try {
          const result = await m.handler(this.pages, groups, raw);
          this.log.push(`matched: ${m.re} -> ${m.desc ?? 'handler'} -> ${result}`);
          return result;
        } catch (err: any) {
          const message = `Error executing step "${raw}" using pattern ${m.re}: ${err?.message || err}`;
          throw new Error(message);
        }
      }
    }

    // fallback behavior
    try {
      const fb = await this.fallbackInvoke(raw);
      if (fb !== null) return fb;
    } catch (err: any) {
      throw new Error(`Fallback invocation failed for step "${raw}": ${err?.message || err}`);
    }

    // no mapping found
    throw new Error(`No mapping found for step: "${raw}". Register a mapping with registerMapping or add a more specific regex.`);
  }

  getLog() {
    return this.log.slice();
  }

  // allow test code to register custom mappings at runtime
  extend(re: RegExp, handler: MappingHandler, desc?: string) {
    this.registerMapping(re, handler, desc);
  }
}
