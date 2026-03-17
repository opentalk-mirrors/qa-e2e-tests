// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from './ModeratorToolsPage';

export class MessagesPage extends ModeratorToolsPage {
  public readonly page: Page;
  private readonly messagesTabPanel: Locator;
  private readonly backButton: Locator;
  private readonly threadDetail: Locator;
  private readonly newMessageButton: Locator;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.page = page;
    this.messagesTabPanel = this.page.getByRole('tabpanel', { name: 'Messages' });
    this.backButton = this.messagesTabPanel.getByRole('button', { name: 'Back' });
    this.threadDetail = this.messagesTabPanel
      .locator('//*[@data-sentry-element="ListItemText"]')
      .locator('//*[@data-sentry-element="Typography"]');
    this.newMessageButton = this.page.getByRole('button', { name: 'New Message', exact: true });
  }

  public async getAllThreadsDetails(): Promise<Record<string, string>> {
    const texts = await this.threadDetail.allInnerTexts();
    const threads: Record<string, string> = {};
    for (let i = 0; i < texts.length; i += 2) {
      threads[texts[i]] = texts[i + 1];
    }
    return threads;
  }

  public async navigateBackToMessagesInbox(): Promise<void> {
    await this.backButton.click();
  }

  public async openMessagesMenu(): Promise<void> {
    await this.newMessageButton.click();
  }

  public async openPrivateMessage(to: string): Promise<void> {
    await this.page.getByRole('menuitem', { name: to }).click();
  }
}
