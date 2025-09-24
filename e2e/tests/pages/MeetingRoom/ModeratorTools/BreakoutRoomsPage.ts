// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class BreakoutRoomsPage extends ModeratorToolsPage {
  private readonly startRoomsButton: Locator;
  private readonly closeRoomButton: Locator;
  private readonly randomDistributionSwitch: Locator;
  private readonly participantsAvatar: Locator;
  private readonly selectionModeDropdown: Locator;
  private readonly selectionModeDropdownItems: Locator;

  constructor(page: Page) {
    super({ page });
    this.startRoomsButton = this.page.getByRole('button', { name: 'Start rooms' });
    this.closeRoomButton = this.page.getByRole('button', { name: 'Close room' });
    this.participantsAvatar = this.page.getByRole('tabpanel').getByTestId('participantAvatar');

    // this is not a nice locator, but the corresponding label is pointing to nowhere
    // see https://git.opentalk.dev/opentalk/qa/reports/-/issues/407
    this.randomDistributionSwitch = this.page.locator('//input[@name="distribution"]');
    this.selectionModeDropdown = this.page.getByRole('combobox');
    this.selectionModeDropdownItems = this.page.getByRole('listbox');
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

  public async getSelectionModeOptions(): Promise<string[]> {
    await this.selectionModeDropdown.click();
    await this.selectionModeDropdownItems.innerText();
    const itemsAsText = await this.selectionModeDropdownItems.innerText();
    return itemsAsText.trim().split('\n');
  }
}
