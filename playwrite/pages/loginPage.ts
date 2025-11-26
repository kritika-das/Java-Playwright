import { Page } from 'playwright';

export class LoginPage {
  constructor(private page: Page) {}

  async enterUsername(username: string) {
    await this.page.fill('input[name="username"]', username);
    return `entered username: ${username}`;
  }

  async enterPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
    return `entered password`;
  }

  async clickLogin() {
    await this.page.click('button[type="submit"]');
    return 'clicked login';
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    return `logged in as ${username}`;
  }
}
