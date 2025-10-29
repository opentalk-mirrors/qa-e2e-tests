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
    readonly votingDurationButton: Locator;
    readonly allowAbstainingToggleButton: Locator;
    readonly autoCloseToggleButtonTooltipDescription: Locator;
    readonly autoCloseToggleButton: Locator;
    readonly votingTypeDropdownInput: Locator;
    readonly votingTypeDropdown: Locator;
  };

  public readonly sessionDurationDialog: {
    readonly dialogContainer: Locator;
    readonly sessionDurationTitle: Locator;
    readonly oneMinuteDurationButton: Locator;
    readonly twoMinuteDurationButton: Locator;
    readonly fiveMinuteDurationButton: Locator;
    readonly customDurationButton: Locator;
    readonly unlimitedTimeDurationButton: Locator;
    readonly saveSessionDurationButton: Locator;
    readonly closeSessionDurationButton: Locator;
    readonly customDurationButtonInput: Locator;
    readonly customDurationLabel: Locator;
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
      votingDurationButton: this.page.getByRole('button', { name: /^Duration.*/i }),
      allowAbstainingToggleButton: this.page.locator('//input[@name="enableAbstain"]'),
      autoCloseToggleButtonTooltipDescription: this.page
        .getByRole('tooltip')
        .getByText('Activate or deactivate automatic exit once all votes have been cast', { exact: true }),
      autoCloseToggleButton: this.page.locator('//input[@name="autoClose"]'),
      votingTypeDropdownInput: this.page.getByRole('combobox'),
      votingTypeDropdown: this.page.getByRole('listbox'),
    };

    this.sessionDurationDialog = {
      dialogContainer: this.page.getByRole('dialog', { name: 'Session Duration', exact: true }),
      sessionDurationTitle: this.page.locator('//p[@id="duration-field-popover-title"]'),
      oneMinuteDurationButton: this.page.getByRole('dialog').getByRole('button', { name: '1 minute' }),
      twoMinuteDurationButton: this.page.getByRole('dialog').getByRole('button', { name: '2 minutes' }),
      fiveMinuteDurationButton: this.page.getByRole('dialog').getByRole('button', { name: '5 minutes' }),
      unlimitedTimeDurationButton: this.page.getByRole('dialog').getByRole('button', { name: 'Unlimited duration' }),
      customDurationButton: this.page.getByRole('dialog').getByRole('button', { name: 'Custom duration' }),
      customDurationButtonInput: this.page.getByRole('dialog').getByRole('spinbutton'),
      customDurationLabel: this.page.getByRole('dialog').getByText('Enter custom duration (min)'),
      saveSessionDurationButton: this.page.getByRole('dialog').getByRole('button', { name: 'Save' }),
      closeSessionDurationButton: this.page.getByRole('dialog').getByRole('button', { name: 'Close' }),
    };
  }

  public async createNewVotingRoom(): Promise<void> {
    await this.createNewVotingButton.click();
    await this.createNewVoting.createVotingTitle.waitFor({ state: 'visible' });
  }

  public async exitVotingRoomCreation(): Promise<void> {
    await this.createNewVoting.backButton.click();
  }

  public async openSessionDurationDialog(): Promise<void> {
    const dialogVisible = await this.isSessionDurationDialogVisible();
    if (!dialogVisible) {
      await this.createNewVoting.votingDurationButton.click();
    }
    await this.sessionDurationDialog.sessionDurationTitle.waitFor({ state: 'attached' });
  }

  public async hoverAutoCloseToggleButton(): Promise<void> {
    await this.createNewVoting.autoCloseToggleButton.hover();
    const autoCloseToggleButtonTooltip = this.createNewVoting.autoCloseToggleButtonTooltipDescription;
    await autoCloseToggleButtonTooltip.waitFor({ state: 'visible' });
  }

  public async closeSessionDurationDialog(): Promise<void> {
    await this.sessionDurationDialog.closeSessionDurationButton.click();
    await this.sessionDurationDialog.dialogContainer.waitFor({ state: 'detached' });
  }

  public async isSessionDurationDialogVisible(): Promise<boolean> {
    return await this.sessionDurationDialog.dialogContainer.isVisible();
  }

  public async selectVotingSessionDuration(duration: string): Promise<void> {
    const dialogVisible = await this.isSessionDurationDialogVisible();
    if (!dialogVisible) {
      await this.openSessionDurationDialog();
    }
    await this.getDurationLocator(duration).click();
  }

  public async saveSessionDuration(): Promise<void> {
    await this.sessionDurationDialog.saveSessionDurationButton.click();
  }

  public async fillLocatorInputValue(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  public async checkCustomDurationInputValue(expectedValue: string): Promise<boolean> {
    const customDurationButtonInput = this.sessionDurationDialog.customDurationButtonInput;
    const resultedValue = await customDurationButtonInput.getAttribute('value');
    return expectedValue === resultedValue;
  }

  private getDurationLocator(duration: string): Locator {
    switch (duration) {
      case '1 min':
        return this.sessionDurationDialog.oneMinuteDurationButton;

      case '2 min':
        return this.sessionDurationDialog.twoMinuteDurationButton;

      case '5 min':
        return this.sessionDurationDialog.fiveMinuteDurationButton;

      case 'Unlimited Time':
        return this.sessionDurationDialog.unlimitedTimeDurationButton;

      case 'Custom':
        return this.sessionDurationDialog.customDurationButton;

      default:
        throw new Error('Invalid duration');
    }
  }

  public async isDurationSelected(duration: string): Promise<boolean> {
    const button = this.getDurationLocator(duration);
    return await button.evaluate((element) => element.getAttribute('aria-selected') === 'true');
  }

  public async incrementCustomDuration(): Promise<void> {
    await this.sessionDurationDialog.customDurationButtonInput.press('ArrowUp');
  }

  public async decrementCustomDuration(): Promise<void> {
    await this.sessionDurationDialog.customDurationButtonInput.press('ArrowDown');
  }
}
