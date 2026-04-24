// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class KeycloakPage {
  private readonly page: Page;
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly loginBtn: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.username = this.page.getByRole('textbox', { name: 'Username or email', exact: true });
    this.password = this.page.getByRole('textbox', { name: 'Password', exact: true });
    this.loginBtn = this.page.getByRole('button', { name: 'Sign In', exact: true });
  }

  public async login(authUrl: string, username: string, password: string): Promise<string> {
    await this.page.goto(authUrl, { waitUntil: 'load' });
    await this.username.fill(username);
    await this.password.fill(password);
    await Promise.all([this.loginBtn.click()]);
    return this.page.url();
  }
}
