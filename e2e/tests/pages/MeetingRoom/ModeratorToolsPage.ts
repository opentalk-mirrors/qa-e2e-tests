// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ModeratorToolsPage {
  protected readonly page: Page;

  constructor({ page }: { page: Page }) {
    this.page = page;
  }

  public getHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }
}
