import { chromium, type BrowserContext, type Page } from 'playwright';

export class PlaywrightSessionManager {
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(private readonly userDataDir: string) {}

  async launch(): Promise<Page> {
    if (this.context || this.page) {
      throw new Error('Playwright session is already active. Close it before launching again.');
    }

    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless: false
    });
    this.page = await this.context.newPage();
    await this.page.goto('https://chat.zalo.me/', { waitUntil: 'domcontentloaded' });
    return this.page;
  }

  async close(): Promise<void> {
    await this.context?.close();
    this.context = null;
    this.page = null;
  }
}
