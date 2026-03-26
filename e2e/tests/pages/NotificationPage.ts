// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { waitForDomStopChanging } from '../helper/waitingHelpers';
import { MeetingRoomPage } from './MeetingRoom/MeetingRoomPage';

export class NotificationPage {
  private readonly page: Page;
  private readonly baseAlertLocator: Locator;
  private readonly breakoutRoomAlertLocator: Locator;
  private readonly joinBreakoutRoomLocator: Locator;
  private readonly leaveBreakoutRoomLocator: Locator;
  private readonly closeButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.baseAlertLocator = this.page.locator('xpath=//*[@role="alert"]//span');
    this.breakoutRoomAlertLocator = this.page.getByRole('alertdialog');
    this.joinBreakoutRoomLocator = this.breakoutRoomAlertLocator.getByRole('button', { name: 'Join Room' });
    this.leaveBreakoutRoomLocator = this.breakoutRoomAlertLocator.getByRole('button', { name: 'Leave Room' });
    this.closeButton = this.page.getByRole('alert').getByRole('button', { name: 'Close' });
  }

  public async getAlertNotificationText(): Promise<string> {
    await this.baseAlertLocator.waitFor();
    return await this.baseAlertLocator.innerText();
  }

  public async getAllAlertNotificationsTexts(): Promise<string[]> {
    await this.baseAlertLocator.first().waitFor();
    const notificationTexts: string[] = [];
    for (const alertLocator of await this.baseAlertLocator.all()) {
      notificationTexts.push(await alertLocator.innerText());
    }
    return notificationTexts;
  }

  public async joinBreakoutRoom(): Promise<void> {
    await this.transitionBreakoutRoom(this.joinBreakoutRoomLocator);
  }

  public async leaveBreakoutRoom(): Promise<void> {
    await this.transitionBreakoutRoom(this.leaveBreakoutRoomLocator);
  }

  private async transitionBreakoutRoom(button: Locator): Promise<void> {
    const meetingRoomPage = new MeetingRoomPage({ page: this.page });
    const meetingRoomNameBefore = await meetingRoomPage.getMeetingRoomName();
    const responsePromise = this.page.waitForResponse(
      (response) =>
        (response.url().endsWith('/start') || response.url().endsWith('/start_invited')) &&
        response.status() === 200 &&
        response.request().method() === 'POST'
    );
    await button.click();
    await responsePromise;
    await button.waitFor({ state: 'detached' });
    let meetingRoomNameAfter: string;
    do {
      meetingRoomNameAfter = await meetingRoomPage.getMeetingRoomName();
    } while (meetingRoomNameAfter === meetingRoomNameBefore);
  }

  public async closeNotificationAlert(): Promise<void> {
    await this.baseAlertLocator.waitFor();
    await this.closeButton.click();
    await waitForDomStopChanging(this.page);
  }
}
