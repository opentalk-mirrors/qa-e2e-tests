// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ModeratorToolsPage {
  public readonly page: Page;
  public readonly heading: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.heading = this.page.getByRole('tabpanel').getByRole('heading').first();
  }

  public async getHeadingText() {
    return await this.heading.innerText();
  }
}
