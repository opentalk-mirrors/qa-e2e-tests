// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ModeratorToolsPage {
  public readonly page: Page;
  public readonly heading: Locator;
  public readonly subHeading: Locator;
  private readonly button: Locator;
  private readonly menuItem: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.heading = this.page.getByRole('tabpanel').getByRole('heading').first();
    this.subHeading = this.page.getByRole('tabpanel').getByRole('paragraph').first();
    this.button = this.page.getByRole('button');
    this.menuItem = this.page.getByRole('menuitem');
  }

  private async getAllButtons(): Promise<Locator[]> {
    return await this.button.all();
  }

  public async getAllButtonsInnerText(): Promise<string[]> {
    const buttons = await this.getAllButtons();
    return await Promise.all(buttons.map(async (button) => (await button.innerText()).replace(/\n/g, '')));
  }

  public async getHeadingText(): Promise<string> {
    return await this.heading.innerText();
  }

  public async getSubHeadingText(): Promise<string> {
    return await this.subHeading.innerText();
  }

  public async getTextboxByLabel(label: string): Promise<Locator> {
    return this.page.getByRole('textbox', { name: label, exact: true });
  }

  private async getAllMenuItems(): Promise<Locator[]> {
    return await this.menuItem.all();
  }

  public async getAllMenuItemsInnerText(): Promise<string[]> {
    const menuItems = await this.getAllMenuItems();
    return await Promise.all(menuItems.map(async (menuItem) => (await menuItem.innerText()).replace(/\n/g, '')));
  }
}
