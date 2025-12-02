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
  private readonly dropdownOption: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.heading = this.page.getByRole('tabpanel').getByRole('heading').first();
    this.subHeading = this.page.getByRole('tabpanel').getByRole('paragraph').first();
    this.button = this.page.getByRole('button');
    this.menuItem = this.page.getByRole('menuitem');
    this.dropdownOption = this.page.getByRole('option');
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

  public getTextboxByLabel(label: string): Locator {
    return this.page.getByRole('textbox', { name: label, exact: true });
  }

  private async getAllMenuItems(): Promise<Locator[]> {
    return await this.menuItem.all();
  }

  public async getAllMenuItemsInnerText(): Promise<string[]> {
    const menuItems = await this.getAllMenuItems();
    return await Promise.all(menuItems.map(async (menuItem) => (await menuItem.innerText()).replace(/\n/g, '')));
  }

  private async getAllDropdownOptions(): Promise<Locator[]> {
    return await this.dropdownOption.all();
  }

  public async getAllDropdownOptionsInnerText(): Promise<string[]> {
    const options = await this.getAllDropdownOptions();
    return await Promise.all(options.map(async (option) => await option.innerText()));
  }

  private getDropdownOptionByName(optionName: string): Locator {
    return this.page.getByRole('option', { name: optionName, exact: true });
  }

  private getSwitchByName(switchName: string): Locator {
    return this.page.getByRole('switch', { name: switchName, exact: true });
  }

  public async selectField(field: string): Promise<void> {
    await this.getTextboxByLabel(field).click();
  }

  public async enterFieldValue(field: string, value: string): Promise<void> {
    await this.getTextboxByLabel(field).fill(value);
  }

  public async getFieldInputValue(field: string): Promise<string> {
    return await this.getTextboxByLabel(field).inputValue();
  }

  public async getFieldPlaceholderValue(field: string): Promise<string> {
    return (await this.getTextboxByLabel(field).getAttribute('placeholder')) ?? '';
  }

  public async toggleSwitch(switchName: string): Promise<void> {
    try {
      await this.getSwitchByName(switchName).click();
    } catch {
      await this.page.locator(`//input[@name="${switchName}"]`).click();
    }
  }

  public async selectDropdownOption(votingType: string): Promise<void> {
    await this.getDropdownOptionByName(votingType).click();
  }
}
