// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class BreakoutRoomsPage extends ModeratorToolsPage {
  public readonly startRoomsButton: Locator;
  public readonly closeRoomButton: Locator;
  private readonly randomDistributionSwitch: Locator;
  private readonly participantsAvatar: Locator;
  private readonly selectionModeDropdown: Locator;
  private readonly selectionModeDropdownItems: Locator;
  private readonly createdRoomsDropdown: Locator;
  private readonly errorMessages: Locator;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.startRoomsButton = this.page.getByRole('button', { name: 'Start rooms' });
    this.closeRoomButton = this.page
      .getByRole('tabpanel', { name: 'Create breakout rooms' })
      .getByRole('button', { name: 'Close room' });
    this.participantsAvatar = this.page.getByRole('tabpanel').getByTestId('participantAvatar');
    this.createdRoomsDropdown = this.page.getByRole('tabpanel').getByText(/Room \d+/);
    this.randomDistributionSwitch = this.page.getByLabel('Random distribution');
    this.selectionModeDropdown = this.page.getByRole('combobox');
    this.selectionModeDropdownItems = this.page.getByRole('listbox');
    this.errorMessages = this.page.getByRole('alert');
  }

  public async startRooms(timeout: number): Promise<void> {
    await this.startRoomsButton.click();
    await this.startRoomsButton.waitFor({ state: 'detached', timeout });
  }

  public async closeRoom(): Promise<void> {
    await this.closeRoomButton.click();
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

  public async getSelectionMode(): Promise<string> {
    const selectionMode = await this.selectionModeDropdown.innerText();
    return selectionMode.trim();
  }

  public async setSelectionMode(mode: string) {
    await this.selectionModeDropdown.click();
    await this.selectionModeDropdownItems.getByText(mode).click();
  }

  public async isDistributionRandom(): Promise<boolean> {
    return await this.randomDistributionSwitch.isChecked();
  }

  public async countCreatedRooms(): Promise<number> {
    return (await this.createdRoomsDropdown.all()).length;
  }

  public async getErrorMessages(): Promise<string[]> {
    return (await this.errorMessages.allInnerTexts()).map((message) => message.trim());
  }

  public async getListOfRoomsToBeCreated(): Promise<string[]> {
    return (await this.createdRoomsDropdown.allInnerTexts()).map((room) => room.trim());
  }
}
