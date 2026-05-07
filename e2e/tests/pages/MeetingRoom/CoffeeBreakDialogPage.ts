// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

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
    this.timerText = this.page.getByTestId('timer-typography');
    this.backToConferenceButton = this.page.getByRole('button', { name: 'Back to the conference' });
  }

  public async isCoffeeBreakDialogOpen(): Promise<boolean> {
    return await this.coffeeBreakDialog.isVisible();
  }

  public async isCoffeeBreakDialogClosed(): Promise<boolean> {
    return await this.coffeeBreakDialog.isHidden();
  }

  public async waitForCoffeeBreakToEnd(): Promise<void> {
    await this.coffeeBreakDialog.waitFor({ state: 'detached' });
  }

  public async goBackToConference(): Promise<void> {
    await this.backToConferenceButton.click();
  }
}
