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
  private readonly numberOfRoomsInput: Locator;
  private readonly roomsToBeCreatedRegex: RegExp;
  private readonly roomsToBeCreated: Locator;
  private readonly createdRoomsDropdown: Locator;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.startRoomsButton = this.page.getByRole('button', { name: 'Start rooms' });
    this.closeRoomButton = this.page
      .getByRole('tabpanel', { name: 'Create breakout rooms' })
      .getByRole('button', { name: 'Close room' });
    this.participantsAvatar = this.page.getByRole('tabpanel').getByTestId('participantAvatar');
    this.createdRoomsDropdown = this.page.getByRole('tabpanel').getByText(/Room \d+/);

    // this is not a nice locator, but the corresponding label is pointing to nowhere
    // see https://git.opentalk.dev/opentalk/qa/reports/-/issues/407
    this.randomDistributionSwitch = this.page.locator('//input[@name="distribution"]');
    this.selectionModeDropdown = this.page.getByRole('combobox');
    this.selectionModeDropdownItems = this.page.getByRole('listbox');
    this.numberOfRoomsInput = this.page.locator('//input[@name="rooms"]');
    this.roomsToBeCreatedRegex = /Create (\d+) Rooms/;
    this.roomsToBeCreated = this.page.getByText(this.roomsToBeCreatedRegex);
  }

  public async startRooms(): Promise<void> {
    await this.startRoomsButton.click();
    await this.startRoomsButton.waitFor({ state: 'detached' });
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

  public async getNumberOfRoomsSetting(): Promise<string> {
    const numberOfRooms = await this.numberOfRoomsInput.inputValue();
    return numberOfRooms.trim();
  }

  public async isDistributionRandom(): Promise<boolean> {
    return await this.randomDistributionSwitch.isChecked();
  }

  async getNumberOfRoomsToBeCreated(): Promise<number> {
    const fullText = await this.roomsToBeCreated.innerText();
    const matchNoRooms = fullText.match(this.roomsToBeCreatedRegex);
    return matchNoRooms ? parseInt(matchNoRooms[1], 10) : 0;
  }

  public async countCreatedRooms(): Promise<number> {
    return (await this.createdRoomsDropdown.all()).length;
  }
}
