// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// the pop-up that appears after clicking on more-options => invite guest
// in the meeting room
import { Locator, Page, Response } from '@playwright/test';

export class GlitchTipPage {
  private readonly page: Page;
  public readonly glitchTipPopup: Locator;
  private readonly closeButton: Locator;
  private readonly sendCrashReportButton: Locator;
  private readonly nameTextbox: Locator;
  private readonly emailTextbox: Locator;
  private readonly descriptionTextbox: Locator;
  public readonly sendingSuccessfulPopup: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.glitchTipPopup = this.page.getByRole('dialog', { name: `Oh, it looks like we're having issues.` }).nth(0);
    this.closeButton = this.page.getByRole('button', { name: 'Close dialog' });
    this.sendCrashReportButton = this.page.getByRole('button', { name: 'Send crash report' });
    this.nameTextbox = this.page.getByRole('textbox', { name: 'Name' });
    this.emailTextbox = this.page.getByRole('textbox', { name: 'Email' });
    this.descriptionTextbox = this.page.getByRole('textbox', { name: 'Description' });
    this.sendingSuccessfulPopup = this.page.getByRole('dialog', { name: 'Sending successful!' });
  }

  public async closePopup(): Promise<void> {
    await this.closeButton.click();
    await this.glitchTipPopup.waitFor({ state: 'hidden' });
  }

  public async sendCrashReport(): Promise<Response> {
    const crashReportPromise = this.page.waitForResponse((response: Response) => {
      return response.url().includes('/api/5/envelope/') && response.request().method() === 'POST';
    });
    await this.sendCrashReportButton.click();
    const response: Response = await crashReportPromise;

    if (response.status() === 200) {
      await this.glitchTipPopup.waitFor({ state: 'detached' });
      await this.sendingSuccessfulPopup.waitFor({ state: 'visible' });
    }

    return response;
  }

  public async enterName(name: string): Promise<void> {
    await this.nameTextbox.fill(name);
  }

  public async enterEmail(email: string): Promise<void> {
    await this.emailTextbox.fill(email);
  }

  public async enterDescription(description: string): Promise<void> {
    await this.descriptionTextbox.fill(description);
  }

  public async getSendingSuccessfulPopupText(): Promise<string> {
    return await this.sendingSuccessfulPopup.innerText();
  }
}
