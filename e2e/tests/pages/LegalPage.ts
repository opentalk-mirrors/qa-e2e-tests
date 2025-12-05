// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext, Locator, Page } from '@playwright/test';

import { config } from '../config';
import { navigateToExternalPage } from '../helper/externalPageHelper';
import { SidebarPage } from './SidebarPage';

export class LegalPage {
  private readonly context: BrowserContext;

  public readonly page: Page;
  public readonly title: Locator;
  public readonly imprintLink: Locator;
  public readonly dataProtectionLink: Locator;

  constructor({ page, context }: { page: Page; context: BrowserContext }) {
    this.page = page;
    this.context = context;
    this.title = this.page.getByRole('heading', { name: 'Legal' });
    this.imprintLink = this.page.getByRole('link', { name: 'Imprint' });
    this.dataProtectionLink = this.page.getByRole('link', { name: 'Data Protection' });
  }

  public async navigateToLegalPage(): Promise<void> {
    await this.page.goto(config.INSTANCE_URL, { waitUntil: 'load' });

    const sidebarPage = new SidebarPage({ page: this.page });
    await sidebarPage.legalButton.click();
  }

  public async navigateToImprintPage(): Promise<Page> {
    return await navigateToExternalPage(this.context, this.imprintLink);
  }

  public async navigateToDataProtectionPage(): Promise<Page> {
    return await navigateToExternalPage(this.context, this.dataProtectionLink);
  }
}
