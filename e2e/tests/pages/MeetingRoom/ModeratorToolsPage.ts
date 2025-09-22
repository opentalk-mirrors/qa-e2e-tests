// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ModeratorToolsPage {
  public readonly page: Page;
  public readonly heading: Locator;
  private readonly button: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.heading = this.page.getByRole('tabpanel').getByRole('heading').first();
    this.button = this.page.getByRole('button');
  }

  private async getAllButtons(): Promise<Locator[]> {
    return await this.button.all();
  }

  public async getAllButtonsInnerText(): Promise<string[]> {
    const buttons = await this.getAllButtons();
    return await Promise.all(buttons.map(async (button) => await button.innerText()));
  }

  public async getHeadingText(): Promise<string> {
    return await this.heading.innerText();
  }

  public async getTextboxByLabel(label: string): Promise<Locator> {
    return this.page.getByRole('textbox', { name: label });
  }
}
