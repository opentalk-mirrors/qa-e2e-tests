// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class NotificationPage {
  private readonly page: Page;
  private readonly baseAlertLocator: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.baseAlertLocator = this.page.locator('xpath=//*[@role="alert"]//span');
  }

  public async getAlertNotificationText(): Promise<string> {
    await this.baseAlertLocator.waitFor();
    return await this.baseAlertLocator.innerText();
  }
}
