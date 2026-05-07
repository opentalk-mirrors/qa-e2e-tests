// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { Locator, Page } from '@playwright/test';

export class ParticipantListWithCheckboxesPage {
  public readonly participantList: Locator;
  public readonly participantListCheckboxes: Locator;
  page: Page;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.participantList = this.participantList = this.page.getByRole('list').getByRole('listitem');
    this.participantListCheckboxes = this.participantList.getByRole('checkbox');
  }

  public async selectParticipantByIndexes(indexes: number[]): Promise<void> {
    for (const index of indexes) {
      const checkbox = this.participantListCheckboxes.nth(index);
      await checkbox.check();
    }
  }

  public async selectParticipantByNames(names: string[]): Promise<void> {
    for (const name of names) {
      const checkbox = this.getParticipantItemByName(name).getByRole('checkbox');
      await checkbox.check();
    }
  }

  public async isParticipantCheckboxCheckedAt(index: number): Promise<boolean> {
    return await this.participantListCheckboxes.nth(index).isChecked();
  }

  public getParticipantItemByName(name: string): Locator {
    return this.participantList.filter({ hasText: name });
  }
}
