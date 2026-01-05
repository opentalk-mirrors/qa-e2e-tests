// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class VotingRoomPage {
  public readonly page: Page;
  public readonly votingRoomHeading: Locator;
  public readonly votingRoomMessage: Locator;
  private readonly createNewVotingButton: Locator;
  public readonly saveButton: Locator;
  public readonly savedVotingItems: Locator;
  public readonly savedVotingsButton: Locator;

  public readonly createNewVoting: {
    readonly backButton: Locator;
    readonly createVotingTitle: Locator;
    readonly allowAbstainingToggleButton: Locator;
    readonly autoCloseToggleButtonTooltipDescription: Locator;
    readonly autoCloseToggleButton: Locator;
    readonly votingTypeDropdownInput: Locator;
    readonly votingTypeDropdown: Locator;
    readonly titleField: Locator;
    readonly subtitleField: Locator;
    readonly topicField: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.votingRoomHeading = this.page.getByRole('heading', { name: 'Voting', exact: true });
    this.votingRoomMessage = this.page
      .getByRole('paragraph')
      .getByText('There are no votes for this conference at the moment.', { exact: true });
    this.createNewVotingButton = this.page.getByRole('button', { name: 'Create new voting' });
    this.saveButton = this.page.getByRole('button', { name: 'Save', exact: true });

    this.createNewVoting = {
      backButton: this.page.getByRole('button', { name: 'back' }),
      createVotingTitle: this.page.getByText('Create Voting', { exact: true }),
      allowAbstainingToggleButton: this.page.locator('//input[@name="enableAbstain"]'),
      autoCloseToggleButtonTooltipDescription: this.page
        .getByRole('tooltip')
        .getByText('Activate or deactivate automatic exit once all votes have been cast', { exact: true }),
      autoCloseToggleButton: this.page.locator('//input[@name="autoClose"]'),
      votingTypeDropdownInput: this.page.getByRole('combobox'),
      votingTypeDropdown: this.page.getByRole('listbox'),
      titleField: this.page.getByRole('textbox', { name: 'Title', exact: true }),
      subtitleField: this.page.getByRole('textbox', { name: 'Subtitle', exact: true }),
      topicField: this.page.getByRole('textbox', { name: 'Topic', exact: true }),
    };

    this.savedVotingItems = this.page.locator('ul .MuiListItemText-root');
    this.savedVotingsButton = this.page.getByRole('button', { name: 'Saved Votings', exact: true });
  }

  public async createNewVotingRoom(): Promise<void> {
    await this.createNewVotingButton.click();
    await this.createNewVoting.createVotingTitle.waitFor({ state: 'visible' });
  }

  public async exitVotingRoomCreation(): Promise<void> {
    await this.createNewVoting.backButton.click();
  }

  public async hoverAutoCloseToggleButton(): Promise<void> {
    await this.createNewVoting.autoCloseToggleButton.hover();
    const autoCloseToggleButtonTooltip = this.createNewVoting.autoCloseToggleButtonTooltipDescription;
    await autoCloseToggleButtonTooltip.waitFor({ state: 'visible' });
  }

  public async openVotingTypeDropdown(): Promise<void> {
    await this.createNewVoting.votingTypeDropdownInput.click();
  }

  public async save(): Promise<void> {
    await this.saveButton.click();
  }

  public async getTitleInputValue(): Promise<string> {
    return await this.createNewVoting.titleField.inputValue();
  }

  public async getSubtitleInputValue(): Promise<string> {
    return await this.createNewVoting.subtitleField.inputValue();
  }

  public async getTopicInputValue(): Promise<string> {
    return await this.createNewVoting.topicField.inputValue();
  }

  public async getSavedVotings() {
    const count = await this.savedVotingItems.count();
    const votes: { title: string; topic: string }[] = [];
    for (let i = 0; i < count; i++) {
      const item = this.savedVotingItems.nth(i);
      const title = (await item.locator('span').innerText()).trim();
      const topic = (await item.locator('p').innerText()).trim();
      votes.push({ title, topic });
    }
    return votes;
  }

  public async toggleHideUnhide(): Promise<void> {
    await this.savedVotingsButton.click();
  }

  public async isSavedVotingListVisible() {
    const expanded = await this.savedVotingsButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  public async clickRecentlySavedVoting(): Promise<void> {
    await this.savedVotingItems.last().click();
  }

  public async getVotingFormValues() {
    const moderatorRoomPage = new ModeratorToolsPage({ page: this.page });

    const duration = await moderatorRoomPage.getSessionDuration();

    const allowAbstaining = await this.createNewVoting.allowAbstainingToggleButton.isChecked();

    const autoClose = await this.createNewVoting.autoCloseToggleButton.isChecked();

    return {
      duration,
      allowAbstaining,
      autoClose,
      votingType: (await this.createNewVoting.votingTypeDropdownInput.innerText()).trim(),
      title: await this.getTitleInputValue(),
      subtitle: await this.getSubtitleInputValue(),
      topic: await this.getTopicInputValue(),
    };
  }
}
