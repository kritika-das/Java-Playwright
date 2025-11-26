import { Page } from 'playwright';

export class SearchPage {
  constructor(private page: Page) {}

  async enterSearch(term: string) {
    await this.page.fill('input[type="search"]', term);
    return `entered search: ${term}`;
  }

  async submitSearch() {
    await this.page.press('input[type="search"]', 'Enter');
    return 'submitted search';
  }

  async selectResult(index = 0) {
    const items = await this.page.$$('a.result');
    if (items.length === 0) throw new Error('No search results found');
    await items[Math.min(index, items.length - 1)].click();
    return `selected result ${index}`;
  }
}
