// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { config } from '../config';
import { HomePage } from '../pages/HomePage';

export class LoginPage {
  page: Page;
  signInButton: Locator;
  usernameInputField: Locator;
  passwordInputField: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: /^(Anmelden|Sign In)$/ });
    this.usernameInputField = page.getByRole('textbox', { name: 'Username or email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
  }

  async gotoLoginPage() {
    await Promise.all([this.page.goto(config.INSTANCE_URL), this.page.waitForLoadState('load')]);
    await this.signInButton.isVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInputField.fill(username);
    await this.usernameInputField.press('Tab');
    await this.passwordInputField.fill(password);

    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/token') && response.status() === 200 && response.request().method() === 'POST'
    );
    await this.signInButton.click();
    await responsePromise;

    const homePage = new HomePage({ page: this.page });
    await homePage.currentMeetingsHeaderSelector.waitFor();
  }
}
