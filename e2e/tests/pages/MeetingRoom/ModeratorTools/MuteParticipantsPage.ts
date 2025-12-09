// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { waitForDomStopChanging } from '../../../helper/waitingHelpers';
import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class MuteParticipantsPage extends ModeratorToolsPage {
  private readonly muteAllButton: Locator;

  constructor(page: Page) {
    super({ page: page });
    this.muteAllButton = this.page.getByRole('button', { name: 'All', exact: true });
  }

  public async waitForPageToBeLoaded(): Promise<void> {
    await waitForDomStopChanging(this.page);
  }

  async muteAllParticipants() {
    await this.muteAllButton.click();
    await waitForDomStopChanging(this.page);
  }
}
