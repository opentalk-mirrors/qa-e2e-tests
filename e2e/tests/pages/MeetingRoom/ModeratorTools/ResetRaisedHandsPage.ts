// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';
import { ParticipantListWithCheckboxesPage } from './ParticipantListWithCheckboxesPage';

export class ResetRaisedHandsPage extends ModeratorToolsPage {
  public readonly allButton: Locator;
  public readonly selectedButton: Locator;
  public readonly searchParticipantTextbox: Locator;
  public readonly participantListWithCheckboxesPage: ParticipantListWithCheckboxesPage;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.allButton = this.page.getByRole('button', { name: 'All', exact: true });
    this.selectedButton = this.page.getByRole('button', { name: 'Selected', exact: true });
    this.searchParticipantTextbox = this.page.getByRole('textbox', { name: 'Search participant' });
    this.participantListWithCheckboxesPage = new ParticipantListWithCheckboxesPage({ page: this.page });
  }

  public async resetAllRaisedHands(): Promise<void> {
    await this.allButton.click();
  }

  public async resetHandsOfSelectedParticipants(): Promise<void> {
    await this.selectedButton.click();
  }

  public async selectSearchParticipantTextbox(): Promise<void> {
    await this.searchParticipantTextbox.click();
  }

  public async getPlaceholderValueOfSearchParticipantTextbox(): Promise<string> {
    return (await this.searchParticipantTextbox.getAttribute('placeholder'))!;
  }

  public async searchParticipantInList(searchParticipant: string): Promise<void> {
    await this.searchParticipantTextbox.fill(searchParticipant);
  }

  public async clearSearchedText(): Promise<void> {
    await this.searchParticipantTextbox.clear();
  }
}
