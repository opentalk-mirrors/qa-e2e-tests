// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext, Locator, Page } from '@playwright/test';

import { config } from '../config';
import { navigateToExternalPage } from '../helper/externalPageHelper';
import { SidebarPage } from '../pages/SidebarPage';

export class HelpPage {
  page: Page;
  context: BrowserContext;
  userManualLink: Locator;
  supportLink: Locator;
  userManualHeading: Locator;
  helpHeading: Locator;

  constructor({ page, context }: { page: Page; context: BrowserContext }) {
    this.page = page;
    this.context = context;
    this.helpHeading = this.page.getByRole('heading', { name: 'Help' });
    this.userManualLink = this.page.getByRole('link', { name: 'User Manual' });
    this.supportLink = this.page.getByRole('link', { name: 'Support' });
    this.userManualHeading = this.page.getByRole('heading', { name: 'User manual' });
  }

  async navigateToHelpPage(): Promise<void> {
    await Promise.all([this.page.goto(config.INSTANCE_URL), this.page.waitForLoadState('load')]);
    const sidebarPage = new SidebarPage({ page: this.page });
    await sidebarPage.helpButton.click();
  }

  async navigateToUserManual(): Promise<Page> {
    return await navigateToExternalPage(this.context, this.userManualLink);
  }

  async navigateToSupport(): Promise<Page> {
    return await navigateToExternalPage(this.context, this.supportLink);
  }
}
