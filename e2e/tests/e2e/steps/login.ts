// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given } from '@cucumber/cucumber';

import { authUserFile } from '../../authHelpers';
import { config } from '../../config';
import { changeLanguage } from '../../helper/Api';
import { closeWebkitPopUp } from '../../helper/webkit';
import { LoginPage } from '../../pages/LoginPage';
import { CustomWorld } from '../cucumberWorld';

const userCredentials: Record<string, { username: string; password: string }> = {
  Alice: { username: config.USERNAME, password: config.PASSWORD },
};

Given('{string} has logged in', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page);
  const creds = userCredentials[username];
  if (!creds) {
    throw new Error(`No credentials found for user: ${username}`);
  }

  await loginPage.gotoLoginPage();
  await loginPage.login(creds.username, creds.password);
  await this.context.storageState({ path: authUserFile });
  await changeLanguage('en-US');
  this.currentUser = username;
  if (config.browser === 'webkit') {
    await closeWebkitPopUp({ page: this.page });
  }
});
