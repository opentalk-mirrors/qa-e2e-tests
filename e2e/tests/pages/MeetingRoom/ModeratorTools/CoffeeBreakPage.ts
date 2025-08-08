// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator, Page } from '@playwright/test';

import { CoffeeBreakDialogPage } from '../CoffeeBreakDialogPage';
import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class CoffeeBreakPage extends ModeratorToolsPage {
  public readonly durationButton: Locator;
  public readonly startCoffeeBreakButton: Locator;
  private readonly sessionDurationDialog: Locator;
  public readonly sessionDurationTitle: Locator;
  private readonly fiveMinuteDurationButton: Locator;
  private readonly tenMinuteDurationButton: Locator;
  private readonly fifteenMinuteDurationButton: Locator;
  private readonly thirtyMinuteDurationButton: Locator;
  private readonly customDurationButton: Locator;
  public readonly closeButton: Locator;
  public readonly saveButton: Locator;
  public readonly customDurationLabel: Locator;
  public readonly customDurationField: Locator;
  private readonly selectedDurationLocator: Locator;
  public readonly durationLabel: Locator;
  public readonly timerText: Locator;
  public readonly stopCoffeeBreakButton: Locator;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.durationButton = this.page.getByRole('button', { name: /min/i });
    this.startCoffeeBreakButton = this.page.getByRole('button', { name: 'Start coffee break' });
    this.sessionDurationDialog = this.page.getByRole('dialog', { name: 'Session Duration' });
    this.sessionDurationTitle = this.page.locator('#duration-field-popover-title');
    this.fiveMinuteDurationButton = this.page.getByRole('button', { name: '5 minutes', exact: true });
    this.tenMinuteDurationButton = this.page.getByRole('button', { name: '10 minutes' });
    this.fifteenMinuteDurationButton = this.page.getByRole('button', { name: '15 minutes' });
    this.thirtyMinuteDurationButton = this.page.getByRole('button', { name: '30 minutes' });
    this.customDurationButton = this.page.getByRole('button', { name: 'Custom duration' });
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.customDurationLabel = this.page.getByText('Enter custom duration (min)', { exact: true });
    this.customDurationField = this.page.getByRole('spinbutton');
    this.selectedDurationLocator = this.page.locator('div[role="button"][aria-selected="true"]');
    this.durationLabel = this.page.locator('[data-sentry-component="TimerDuration"] p').nth(0);
    this.timerText = this.page.getByTestId('timer-display');
    this.stopCoffeeBreakButton = this.page.getByRole('button', { name: 'Stop coffee break' });
  }

  public async openDurationDialog(): Promise<void> {
    await this.durationButton.click();
  }

  public async isDurationDialogOpen(): Promise<boolean> {
    await this.sessionDurationDialog.waitFor();
    return await this.sessionDurationDialog.isVisible();
  }

  public async isDurationDialogClosed(): Promise<boolean> {
    return await this.sessionDurationDialog.isHidden();
  }

  public async areAllDurationOptionsVisible(): Promise<boolean> {
    const options = [
      this.fiveMinuteDurationButton,
      this.tenMinuteDurationButton,
      this.fifteenMinuteDurationButton,
      this.thirtyMinuteDurationButton,
      this.customDurationButton,
    ];
    for (const option of options) {
      if (!(await option.isVisible())) {
        return false;
      }
    }
    return true;
  }

  private getDurationOptionLocator(duration: '5 min' | '10 min' | '15 min' | '30 min' | 'Custom'): Locator {
    const durationOption: Record<string, Locator> = {
      '5 min': this.fiveMinuteDurationButton,
      '10 min': this.tenMinuteDurationButton,
      '15 min': this.fifteenMinuteDurationButton,
      '30 min': this.thirtyMinuteDurationButton,
      Custom: this.customDurationButton,
    };
    const option = durationOption[duration];
    return option;
  }

  public async selectDurationOption(duration: '5 min' | '10 min' | '15 min' | '30 min' | 'Custom'): Promise<void> {
    const option = this.getDurationOptionLocator(duration);
    await option.click();
  }

  public async getSelectedDurationText(): Promise<string | null> {
    if ((await this.selectedDurationLocator.count()) === 0) {
      return null;
    }
    const text = await this.selectedDurationLocator.textContent();
    return text?.trim() ?? null;
  }

  public async save() {
    await this.saveButton.click();
  }

  public async close() {
    await this.closeButton.click();
  }

  public async selectCustomDurationField(): Promise<void> {
    await this.customDurationField.click();
  }

  public async selectCustomValue(value: string): Promise<void> {
    await this.customDurationField.fill(value);
  }

  public async incrementCustomDuration(): Promise<void> {
    await this.customDurationField.press('ArrowUp');
  }

  public async decrementCustomDuration(): Promise<void> {
    await this.customDurationField.press('ArrowDown');
  }

  public async selectStartCoffeeBreakButton(): Promise<CoffeeBreakDialogPage> {
    await this.startCoffeeBreakButton.click();
    const coffeeBreakDialogPage = new CoffeeBreakDialogPage({ page: this.page });
    await coffeeBreakDialogPage.coffeeBreakDialog.waitFor();
    return coffeeBreakDialogPage;
  }

  public async isTimerCountingDown(): Promise<boolean> {
    const initialText = await this.timerText.textContent();
    if (!initialText) {
      throw new Error('Timer text not found');
    }
    await expect(this.timerText).not.toHaveText(initialText, { timeout: 3000 });
    const [initialMin, initialSec] = initialText.trim().split(':').map(Number);
    const initialTotalSec = initialMin * 60 + initialSec;
    const updatedText = await this.timerText.textContent();
    if (!updatedText) {
      return false;
    }
    const [updatedMin, updatedSec] = updatedText.trim().split(':').map(Number);
    const updatedTotalSec = updatedMin * 60 + updatedSec;
    return updatedTotalSec < initialTotalSec;
  }
}
