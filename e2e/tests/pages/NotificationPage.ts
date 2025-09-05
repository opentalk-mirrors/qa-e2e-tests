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
    await this.joinBreakoutRoomLocator.click();
    await this.baseAlertLocator.waitFor({ state: 'detached' });
  }

  public async leaveBreakoutRoom(): Promise<void> {
    await this.leaveBreakoutRoomLocator.click();
    await this.baseAlertLocator.waitFor({ state: 'detached' });
  }
}
