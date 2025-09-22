// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class NotificationPage {
  private readonly page: Page;
  private readonly baseAlertLocator: Locator;
  private readonly breakoutRoomAlertLocator: Locator;
  private readonly joinBreakoutRoomLocator: Locator;
  private readonly leaveBreakoutRoomLocator: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.baseAlertLocator = this.page.locator('xpath=//*[@role="alert"]//span');
    this.breakoutRoomAlertLocator = this.page.getByRole('alertdialog');
    this.joinBreakoutRoomLocator = this.breakoutRoomAlertLocator.getByRole('button', { name: 'Join Room' });
    this.leaveBreakoutRoomLocator = this.breakoutRoomAlertLocator.getByRole('button', { name: 'Leave Room' });
  }

  public async getAlertNotificationText(): Promise<string> {
    await this.baseAlertLocator.waitFor();
    return await this.baseAlertLocator.innerText();
  }

  public async joinBreakoutRoom(): Promise<void> {
    await this.transitionBreakoutRoom(this.joinBreakoutRoomLocator);
  }

  public async leaveBreakoutRoom(): Promise<void> {
    await this.transitionBreakoutRoom(this.leaveBreakoutRoomLocator);
  }

  private async transitionBreakoutRoom(button: Locator): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/start') && response.status() === 200 && response.request().method() === 'POST'
    );
    await button.click();
    await responsePromise;
    await button.waitFor({ state: 'detached' });
  }
}
