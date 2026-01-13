// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

/**
 * page object for any place in the application
 * that uses the Session Duration popup
 * e.g., Coffee Break, Timer, or Breakout rooms
 */
export class SessionDurationDialog {
  private readonly page: Page;
  public readonly durationLabel: Locator;
  public readonly dialogContainer: Locator;
  public readonly title: Locator;
  public readonly oneMinuteDurationButton: Locator;
  public readonly twoMinuteDurationButton: Locator;
  public readonly fiveMinuteDurationButton: Locator;
  public readonly tenMinuteDurationButton: Locator;
  public readonly fifteenMinuteDurationButton: Locator;
  public readonly thirtyMinuteDurationButton: Locator;
  public readonly unlimitedTimeDurationButton: Locator;
  public readonly customDurationButton: Locator;
  public readonly customDurationButtonInput: Locator;
  public readonly customDurationLabel: Locator;
  public readonly saveButton: Locator;
  public readonly closeButton: Locator;
  public readonly selectedDurationLocator: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.dialogContainer = this.page.getByRole('dialog', { name: 'Session Duration', exact: true });
    this.title = this.page.locator('//p[@id="duration-field-popover-title"]');
    this.oneMinuteDurationButton = this.page.getByRole('dialog').getByRole('button', { name: '1 minute', exact: true });
    this.twoMinuteDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: '2 minutes', exact: true });
    this.fiveMinuteDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: '5 minutes', exact: true });
    this.tenMinuteDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: '10 minutes', exact: true });
    this.fifteenMinuteDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: '15 minutes', exact: true });
    this.thirtyMinuteDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: '30 minutes', exact: true });
    this.unlimitedTimeDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Unlimited duration', exact: true });
    this.customDurationButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Custom duration', exact: true });
    this.customDurationButtonInput = this.page.getByRole('dialog').getByRole('spinbutton');
    this.customDurationLabel = this.page.getByRole('dialog').getByText('Enter custom duration (min)');
    this.saveButton = this.page.getByRole('dialog').getByRole('button', { name: 'Save' });
    this.closeButton = this.page.getByRole('dialog').getByRole('button', { name: 'Close' });
    this.selectedDurationLocator = this.page.locator('div[role="button"][aria-selected="true"]');
    this.durationLabel = this.page.locator('[data-sentry-component="TimerDuration"] p').nth(0);
  }

  public async selectDuration(duration: string): Promise<void> {
    await this.getDurationLocator(duration).click();
  }

  public async getSelectedDurationText(): Promise<string | null> {
    if ((await this.selectedDurationLocator.count()) === 0) {
      return null;
    }
    const text = await this.selectedDurationLocator.textContent();
    return text?.trim() ?? null;
  }

  public async incrementCustomDuration(): Promise<void> {
    await this.customDurationButtonInput.press('ArrowUp');
  }

  public async decrementCustomDuration(): Promise<void> {
    await this.customDurationButtonInput.press('ArrowDown');
  }

  private getDurationLocator(duration: string): Locator {
    switch (duration) {
      case '1 min':
        return this.oneMinuteDurationButton;
      case '2 min':
        return this.twoMinuteDurationButton;
      case '5 min':
        return this.fiveMinuteDurationButton;
      case '10 min':
        return this.tenMinuteDurationButton;
      case '15 min':
        return this.fifteenMinuteDurationButton;
      case '30 min':
        return this.thirtyMinuteDurationButton;
      case 'Unlimited Time':
        return this.unlimitedTimeDurationButton;
      case 'Custom':
        return this.customDurationButton;
      default:
        throw new Error('Invalid duration');
    }
  }

  public async setCustomDuration(value: string): Promise<void> {
    await this.customDurationButtonInput.fill(value);
    await this.dialogContainer.focus();
  }

  public async activateCustomDurationInput(): Promise<void> {
    await this.customDurationButtonInput.click();
  }

  public async save(): Promise<void> {
    await this.saveButton.click();
  }

  public async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialogContainer.waitFor({ state: 'detached' });
  }
}
