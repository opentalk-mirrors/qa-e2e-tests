// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class VotingRoomPage {
  public readonly page: Page;
  public readonly votingRoomHeading: Locator;
  public readonly votingRoomMessage: Locator;
  private readonly createNewVotingButton: Locator;

  public readonly createNewVoting: {
    readonly backButton: Locator;
    readonly createVotingTitle: Locator;
    readonly allowAbstainingToggleButton: Locator;
    readonly autoCloseToggleButtonTooltipDescription: Locator;
    readonly autoCloseToggleButton: Locator;
    readonly votingTypeDropdownInput: Locator;
    readonly votingTypeDropdown: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.votingRoomHeading = this.page.getByRole('heading', { name: 'Voting', exact: true });
    this.votingRoomMessage = this.page
      .getByRole('paragraph')
      .getByText('There are no votes for this conference at the moment.', { exact: true });
    this.createNewVotingButton = this.page.getByRole('button', { name: 'Create new voting' });

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
    };
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
}
