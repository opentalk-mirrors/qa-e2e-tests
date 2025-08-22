// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ResetRaisedHandsPage {
  private readonly page: Page;
  public readonly resetRaisedHandsTitle: Locator;
  public readonly allButton: Locator;
  public readonly selectedButton: Locator;
  public readonly searchParticipantTextbox: Locator;
  public readonly participantListCheckboxes: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.resetRaisedHandsTitle = this.page.getByRole('heading', { name: 'Reset raised hands' });
    this.allButton = this.page.getByRole('button', { name: 'All', exact: true });
    this.selectedButton = this.page.getByRole('button', { name: 'Selected', exact: true });
    this.searchParticipantTextbox = this.page.getByRole('textbox', { name: 'Search participant' });
    this.participantListCheckboxes = this.page
      .locator('[data-sentry-component="SelectParticipantsItem"]')
      .getByRole('checkbox');
  }

  public async resetAllRaisedHands(): Promise<void> {
    await this.allButton.click();
  }

  public async selectParticipantByIndexes(indexes: number[]): Promise<void> {
    for (const index of indexes) {
      const checkbox = this.participantListCheckboxes.nth(index);
      await checkbox.check();
    }
  }

  public async isParticipantCheckboxCheckedAt(index: number): Promise<boolean> {
    return await this.participantListCheckboxes.nth(index).isChecked();
  }

  public async resetHandsOfSelectedParticipants(): Promise<void> {
    await this.selectedButton.click();
  }
}
