// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class BreakoutRoomsPage {
  public readonly page: Page;
  private readonly startRoomsButton: Locator;
  private readonly closeRoomButton: Locator;
  private readonly randomDistributionSwitch: Locator;
  private readonly participantsAvatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startRoomsButton = this.page.getByRole('button', { name: 'Start rooms' });
    this.closeRoomButton = this.page.getByRole('button', { name: 'Close room' });
    this.participantsAvatar = this.page.getByRole('tabpanel').getByTestId('participantAvatar');

    // this is not a nice locator, but the corresponding label is pointing to nowhere
    // see https://git.opentalk.dev/opentalk/qa/reports/-/issues/407
    this.randomDistributionSwitch = this.page.locator('//input[@name="distribution"]');
  }

  public async startRooms(): Promise<void> {
    await this.startRoomsButton.click();
    await this.startRoomsButton.waitFor({ state: 'detached' });
  }

  public async closeRoom(): Promise<void> {
    await this.closeRoomButton.click();
    await this.closeRoomButton.waitFor({ state: 'detached' });
  }

  public async setRandomDistribution(on = false): Promise<void> {
    await this.randomDistributionSwitch.setChecked(on);
  }

  public async countParticipantsOfAllRooms(): Promise<number> {
    return await this.participantsAvatar.count();
  }
}
