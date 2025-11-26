import { Page } from 'playwright';

export class HomePage {
  constructor(private page: Page) {}

  async verifyHomePageTitle() {
    return await this.page.title();
  }

  async verifyCorrectUserName() {
    // TODO: Add implementation
  }

  async clickOnContactsLink() {
    const frame = this.page.frame({ name: 'mainpanel' });
    const ctx: any = frame ?? this.page;
    await ctx.click(`xpath=//a[contains(text(),\'Contacts\')]`);
    // Page transition to ContactsPage
  }

  async clickOnDealsLink() {
    const frame = this.page.frame({ name: 'mainpanel' });
    const ctx: any = frame ?? this.page;
    await ctx.click(`xpath=//a[contains(text(),\'Deals\')]`);
    // Page transition to DealsPage
  }

  async clickOnTasksLink() {
    const frame = this.page.frame({ name: 'mainpanel' });
    const ctx: any = frame ?? this.page;
    await ctx.click(`xpath=//a[contains(text(),\'Tasks\')]`);
    // Page transition to TasksPage
  }

  async clickOnNewContactLink() {
    const frame = this.page.frame({ name: 'mainpanel' });
    const ctx: any = frame ?? this.page;
    await ctx.click(`xpath=//a[contains(text(),\'New Contact\')]`);
  }

}
