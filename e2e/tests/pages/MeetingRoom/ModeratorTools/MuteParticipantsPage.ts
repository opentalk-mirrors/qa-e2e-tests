// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

import { waitForDomStopChanging } from '../../../helper/waitingHelpers';
import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class MuteParticipantsPage extends ModeratorToolsPage {
  constructor(page: Page) {
    super({ page: page });
  }

  public async waitForPageToBeLoaded(): Promise<void> {
    await waitForDomStopChanging(this.page);
  }
}
