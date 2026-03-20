// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { ModeratorToolsPage } from './ModeratorToolsPage';

export class PeopleOptionPage extends ModeratorToolsPage {
  public readonly page: Page;
  public readonly searchParticipantTextbox: Locator;
  public readonly sortByButton: Locator;
  public readonly participantsList: Locator;
  public readonly participantName: Locator;
  public readonly participantTime: Locator;
  public readonly participantAvatar: Locator;
  public readonly guestLabel: Locator;
  public readonly microphonesStatus: Locator;
  public readonly sortByDropdown: Locator;
  private readonly threeDotButton: Locator;
  private readonly participantMenu: Locator;
  private readonly sendDirectMessageMenuItem: Locator;
  private readonly removeParticipantMenuItem: Locator;
  private readonly removeParticipantDialog: Locator;
  private readonly removeParticipantConfirmButton: Locator;
  private readonly moveParticipantMenuItem: Locator;
  private readonly renameParticipantMenuItem: Locator;
  private readonly newNameTextbox: Locator;
  private readonly saveNewNameButton: Locator;
  private readonly renameErrorText: Locator;
  private readonly revokePresenterRoleMenuItem: Locator;
  private readonly grantPresenterRoleMenuItem: Locator;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.page = page;
    this.searchParticipantTextbox = this.page.getByRole('textbox', { name: 'Search participant' });
    this.sortByButton = this.page.getByRole('button', { name: 'Sort by' });
    this.participantsList = this.page.getByRole('tabpanel', { name: 'People' }).getByRole('list');
    this.participantName = this.page.getByRole('tabpanel', { name: 'People' }).getByRole('list').locator('p');
    this.participantTime = this.page.locator('//*[@data-sentry-element="ListItemText"]').locator('span');
    this.participantAvatar = this.listItem.getByTestId('participantAvatar');
    this.guestLabel = this.listItem.getByText('Guest');
    this.microphonesStatus = this.page.getByRole('img', { name: /^(Microphone is on|Microphone is off)$/ });
    this.sortByDropdown = this.page
      .getByRole('menu')
      .filter({ has: this.page.getByRole('menuitem', { name: 'Name (A - Z)' }) });
    this.threeDotButton = this.page.getByRole('button', { name: 'Open participant menu' });
    this.participantMenu = this.page.getByRole('menu', { name: 'Participant menu' });
    this.sendDirectMessageMenuItem = this.page.getByRole('menuitem', { name: 'Send direct message' });
    this.removeParticipantMenuItem = this.page.getByRole('menuitem', { name: 'Remove participant' });
    this.removeParticipantDialog = this.page.getByRole('dialog', { name: 'Remove participant' });
    this.removeParticipantConfirmButton = this.page.getByRole('button', { name: 'Confirm' });
    this.moveParticipantMenuItem = this.page.getByRole('menuitem', { name: 'Move participant to waiting room' });
    this.renameParticipantMenuItem = this.page.getByRole('menuitem', { name: 'Rename participant' });
    this.newNameTextbox = this.page.getByRole('textbox', { name: 'New name', exact: true });
    this.saveNewNameButton = this.page.getByRole('button', { name: 'Save' });
    this.renameErrorText = this.page.getByRole('dialog', { name: 'Rename participant' }).getByRole('paragraph');
    this.revokePresenterRoleMenuItem = this.page.getByRole('menuitem', { name: 'Revoke presenter role', exact: true });
    this.grantPresenterRoleMenuItem = this.page.getByRole('menuitem', { name: 'Grant presenter role', exact: true });
  }

  public async getAllParticipantsNames(): Promise<string[]> {
    await waitForDomStopChanging(this.page);
    const participantsName: string[] = [];
    for (const participant of await this.participantName.all()) {
      participantsName.push(await participant.innerText());
    }
    return participantsName;
  }

  public async getAllParticipantsTimes(text: 'Joined' | 'Last Active' | 'Hand raised'): Promise<string[]> {
    await waitForDomStopChanging(this.page);
    const participantsTime: string[] = [];
    for (const participant of await this.participantTime.filter({ hasText: text }).all()) {
      participantsTime.push(await participant.innerText());
    }
    return participantsTime.map((text) => text.split(' ')[2] ?? text.split(' ')[1]);
  }

  public async selectSearchParticipant(): Promise<void> {
    await this.searchParticipantTextbox.click();
  }

  public async getSearchParticipantPlaceholder(): Promise<string> {
    return (await this.searchParticipantTextbox.getAttribute('placeholder')) ?? '';
  }

  public async typeInSearchParticipantTextbox(searchText: string): Promise<void> {
    await this.searchParticipantTextbox.fill(searchText);
  }

  public async clearTextInSearchParticipantTextbox(): Promise<void> {
    await this.searchParticipantTextbox.clear();
  }

  public async getSearchParticipantTextboxValue(): Promise<string> {
    return await this.searchParticipantTextbox.inputValue();
  }

  public async showPossibleOrderSelections(): Promise<void> {
    await this.sortByButton.click();
    await this.sortByDropdown.waitFor({ state: 'visible' });
  }

  private getSortOptionLocator(sortOption: string): Locator {
    return this.page.getByRole('menuitem', {
      name: sortOption,
      exact: true,
    });
  }

  public async sortParticipants(selectedOrder: string): Promise<void> {
    if (!(await this.sortByDropdown.isVisible())) {
      await this.showPossibleOrderSelections();
    }

    await this.getSortOptionLocator(selectedOrder).click();
    await this.page.keyboard.press('Escape');
  }

  public async isGuest(name: string): Promise<boolean> {
    const guest = (await this.getAllParticipantsDetails()).filter((guest) => guest.includes(name))[0];
    return guest.includes('Guest');
  }

  public async hoverParticipantsList(to: string): Promise<void> {
    await this.getParticipantLocator(to).locator(this.threeDotButton).hover();
  }

  public async selectParticipantMenu(to: string): Promise<void> {
    await this.getParticipantLocator(to).locator(this.threeDotButton).click();
  }

  public getParticipantLocator(name: string): Locator {
    return this.listItem.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  public async navigateToDirectMessage(): Promise<void> {
    await this.sendDirectMessageMenuItem.click();
  }

  public async removeParticipant(): Promise<void> {
    await this.removeParticipantMenuItem.click();
    await this.removeParticipantConfirmButton.click();
    await this.removeParticipantDialog.waitFor({ state: 'detached' });
  }

  public async moveParticipant(): Promise<void> {
    await this.moveParticipantMenuItem.click();
    await this.participantMenu.waitFor({ state: 'detached' });
  }

  public async renameParticipant(newName: string): Promise<void> {
    await this.renameParticipantMenuItem.click();
    await this.newNameTextbox.fill(newName);
    await this.saveNewNameButton.click();
    await Promise.any([
      this.newNameTextbox.waitFor({ state: 'hidden' }),
      this.renameErrorText.waitFor({ state: 'visible' }),
    ]);
  }

  public async getRenameErrorText(): Promise<string> {
    return await this.renameErrorText.innerText();
  }

  public async revokePresenterRole(): Promise<void> {
    await this.revokePresenterRoleMenuItem.click();
    await this.grantPresenterRoleMenuItem.waitFor({ state: 'visible' });
  }

  public async grantPresenterRole(): Promise<void> {
    await this.grantPresenterRoleMenuItem.click();
    await this.revokePresenterRoleMenuItem.waitFor({ state: 'visible' });
  }
}
