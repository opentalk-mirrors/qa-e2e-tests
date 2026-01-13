// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class StoragePage {
  public readonly page: Page;
  public readonly storageHeading: Locator;
  public readonly storageUsedText: Locator;
  public readonly myFilesHeading: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.storageHeading = this.page.getByRole('heading', { name: 'Storage', exact: true });
    this.storageUsedText = this.page.getByRole('paragraph').getByText('used');
    this.myFilesHeading = this.page.getByRole('heading', { name: 'My Files' });
  }
}
