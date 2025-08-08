// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator, Page } from '@playwright/test';

export class CoffeeBreakDialogPage {
  private readonly page: Page;
  public readonly coffeeBreakDialog: Locator;
  public readonly openTalkLogo: Locator;
  public readonly coffeeBreakIcon: Locator;
  public readonly coffeeBreakText: Locator;
  public readonly timerText: Locator;
  public readonly backToConferenceButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.coffeeBreakDialog = this.page.getByRole('alertdialog', { name: 'Coffee break is in progress' });
    this.openTalkLogo = this.coffeeBreakDialog.locator('svg').first();
    this.coffeeBreakIcon = this.coffeeBreakDialog.locator('svg').nth(1);
    this.coffeeBreakText = this.page.getByRole('heading', { name: 'Coffee break! Time left:', exact: true });
    this.timerText = this.page.locator('[data-sentry-element="TimerTypography"]');
    this.backToConferenceButton = this.page.getByRole('button', { name: 'Back to the conference' });
  }

  public async isCoffeeBreakDialogOpen(): Promise<boolean> {
    return await this.coffeeBreakDialog.isVisible();
  }

  public async isCoffeeBreakDialogClosed(): Promise<boolean> {
    return await this.coffeeBreakDialog.isHidden();
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

  public async waitForCoffeeBreakToEnd(): Promise<void> {
    await this.coffeeBreakDialog.waitFor({ state: 'detached' });
  }
}
