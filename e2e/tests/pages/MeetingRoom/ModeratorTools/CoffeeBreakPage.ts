// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { CoffeeBreakDialogPage } from '../CoffeeBreakDialogPage';
import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class CoffeeBreakPage extends ModeratorToolsPage {
  public readonly startCoffeeBreakButton: Locator;
  public readonly timerText: Locator;
  public readonly stopCoffeeBreakButton: Locator;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.startCoffeeBreakButton = this.page.getByRole('button', { name: 'Start coffee break' });
    this.timerText = this.page.getByTestId('timer-display');
    this.stopCoffeeBreakButton = this.page.getByRole('button', { name: 'Stop coffee break' });
  }

  public async areAllDurationOptionsVisible(): Promise<boolean> {
    const options = [
      this.sessionDurationDialog.fiveMinuteDurationButton,
      this.sessionDurationDialog.tenMinuteDurationButton,
      this.sessionDurationDialog.fifteenMinuteDurationButton,
      this.sessionDurationDialog.thirtyMinuteDurationButton,
      this.sessionDurationDialog.customDurationButton,
    ];
    for (const option of options) {
      if (!(await option.isVisible())) {
        return false;
      }
    }
    return true;
  }

  public async selectStartCoffeeBreakButton(): Promise<CoffeeBreakDialogPage> {
    await this.startCoffeeBreakButton.click();
    const coffeeBreakDialogPage = new CoffeeBreakDialogPage({ page: this.page });
    await coffeeBreakDialogPage.coffeeBreakDialog.waitFor();
    return coffeeBreakDialogPage;
  }

  public async stopCoffeeBreak(): Promise<void> {
    await this.stopCoffeeBreakButton.click();
  }
}
