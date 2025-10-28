// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { SessionDurationDialog } from './ModeratorTools/SessionDurationDialog';

export class ModeratorToolsPage {
  public readonly page: Page;
  public readonly heading: Locator;
  public readonly subHeading: Locator;
  private readonly button: Locator;
  private readonly menuItem: Locator;
  private readonly dropdownOption: Locator;
  protected readonly sessionDurationDialog: SessionDurationDialog;
  public readonly durationButton: Locator;
  private readonly participantNameSelector: Locator;
  private readonly participantTimeSelector: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.heading = this.page.getByRole('tabpanel').getByRole('heading').first();
    this.subHeading = this.page.getByRole('tabpanel').getByRole('paragraph').first();
    this.button = this.page.getByRole('button');
    this.menuItem = this.page.getByRole('menuitem');
    this.dropdownOption = this.page.getByRole('option');
    this.participantNameSelector = this.page.getByRole('listitem').locator('[data-sentry-element="ListItemText"] p');
    this.participantTimeSelector = this.page.getByRole('listitem').locator('[data-sentry-element="ListItemText"] span');
    this.durationButton = this.page.getByRole('button', { name: /^Duration.*/i });

    this.sessionDurationDialog = new SessionDurationDialog(this.page);
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

  public getSwitchByName(switchName: string): Locator {
    return this.page.getByRole('switch', { name: switchName, exact: true });
  }

  public getButtonByName(button: string): Locator {
    return this.page.getByRole('button', { name: button, exact: true });
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

  public async getSessionDuration(): Promise<string> {
    await this.durationButton.waitFor({ state: 'visible' });
    const duration = await this.durationButton.innerText();
    return duration.trim();
  }

  public async isSessionDurationDialogVisible(): Promise<boolean> {
    return await this.sessionDurationDialog.dialogContainer.isVisible();
  }

  public async openSessionDurationDialog(): Promise<SessionDurationDialog> {
    const dialogVisible = await this.isSessionDurationDialogVisible();
    if (!dialogVisible) {
      await this.durationButton.click();
    }
    await this.sessionDurationDialog.title.waitFor({ state: 'attached' });
    return this.sessionDurationDialog;
  }

  public async getParticipantData(childType: 'name' | 'time'): Promise<string[]> {
    let allTexts: string[];
    switch (childType) {
      case 'name':
        allTexts = await this.participantNameSelector.allInnerTexts();
        break;
      case 'time':
        allTexts = await this.participantTimeSelector.allInnerTexts();
        break;
    }
    return allTexts;
  }

  public async getTotalParticipantsNumber(): Promise<number> {
    return (await this.getParticipantData('name')).length;
  }
}
