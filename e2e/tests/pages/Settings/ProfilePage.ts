// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator, Request } from '@playwright/test';

export class ProfilePage {
  public readonly page: Page;
  public readonly profilePictureHeading: Locator;
  public readonly requiredFieldsText: Locator;
  public readonly imageAvatar: Locator;
  public readonly profileNameLabel: Locator;
  public readonly profileNameTextbox: Locator;
  public readonly enterANameText: Locator;
  private readonly errorText: Locator;
  public readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.profilePictureHeading = this.page.getByRole('heading', {
      name: 'Profile Picture',
    });
    this.requiredFieldsText = this.page
      .getByRole('paragraph')
      .getByText('*Required fields are marked with an asterisk. Please fill them out.', { exact: true });
    this.imageAvatar = this.page.getByText('Profile Picture*Required').getByRole('img');
    this.profileNameLabel = this.page.getByLabel('Profile Name');
    this.profileNameTextbox = this.page.getByRole('textbox', {
      name: 'Profile Name',
    });
    this.enterANameText = this.page
      .getByRole('paragraph')
      .getByText(
        'Enter a name (such as your first name, full name, or a nickname) that will be visible to others on OpenTalk.'
      );
    this.errorText = this.page.getByText('OpenTalk LogoProfile').getByRole('paragraph').nth(1);
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
  }

  public async getProfileNameTextboxValue(): Promise<string> {
    return await this.profileNameTextbox.inputValue();
  }

  public async getPlaceholderValueOfProfileNameTextbox(): Promise<string> {
    return (await this.profileNameTextbox.getAttribute('placeholder'))!;
  }

  public async selectProfileNameInputField(): Promise<void> {
    await this.profileNameTextbox.click();
  }

  public async enterProfileName(name: string): Promise<void> {
    await this.profileNameTextbox.fill(name);
  }

  public async clearProfileName(): Promise<void> {
    await this.profileNameTextbox.clear();
  }

  public async saveProfile(): Promise<boolean> {
    let requestSent: boolean = false;
    const request = (request: Request) => {
      if (request.url().includes('/v1/users/me') && request.method() === 'PATCH') {
        requestSent = true;
      }
    };

    this.page.on('request', request);
    await this.saveButton.click();
    this.page.off('request', request);

    return requestSent;
  }

  public async getErrorText(): Promise<string> {
    return await this.errorText.innerText();
  }
}
