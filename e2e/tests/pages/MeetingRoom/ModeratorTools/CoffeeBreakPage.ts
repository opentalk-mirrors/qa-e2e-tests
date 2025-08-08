// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class CoffeeBreakPage extends ModeratorToolsPage {
  public readonly durationButton: Locator;
  public readonly startCoffeeBreakButton: Locator;

  constructor({ page }: { page: Page }) {
    super({ page });
    this.durationButton = this.page.getByRole('button', { name: 'Duration 5 minute' });
    this.startCoffeeBreakButton = this.page.getByRole('button', { name: 'Start coffee break' });
  }
}
