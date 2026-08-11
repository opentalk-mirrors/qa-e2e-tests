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
  invalidCredentialsError: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: /^(Anmelden|Sign In)$/ });
    this.usernameInputField = page.getByRole('textbox', { name: 'Username or email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
    this.invalidCredentialsError = page.getByText('Invalid username or password.');
  }

  async gotoLoginPage() {
    await Promise.all([this.page.goto(config.INSTANCE_URL), this.page.waitForLoadState('load')]);
    await this.signInButton.isVisible();
  }

  public async login(username: string, password: string): Promise<HomePage | LoginPage> {
    await this.usernameInputField.fill(username);
    await this.usernameInputField.press('Tab');
    await this.passwordInputField.fill(password);

    const loginResult = Promise.race([
      this.waitForSuccessfulLogin(),
      this.invalidCredentialsError.waitFor({ state: 'visible' }).then(() => this),
    ]);
    await this.signInButton.click();
    return loginResult;
  }

  private async waitForSuccessfulLogin(): Promise<HomePage> {
    await this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/token') && response.status() === 200 && response.request().method() === 'POST'
    );
    const homePage = new HomePage({ page: this.page });
    await homePage.currentMeetingsHeaderSelector.waitFor();
    return homePage;
  }
}
