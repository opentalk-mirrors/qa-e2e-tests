// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given } from '@cucumber/cucumber';

import { authUserFile } from '../../authHelpers';
import { config } from '../../config';
import { Api } from '../../helper/Api';
import { closeWebkitPopUp } from '../../helper/webkit';
import { LoginPage } from '../../pages/LoginPage';
import { CustomWorld, User } from '../cucumberWorld';

const userCredentials: Record<string, { username: string; password: string; email: string }> = {
  Alice: { username: 'alice', password: 'alice', email: 'alice@example.com' },
  Bob: { username: 'bob', password: 'bob', email: 'alice@example.com' },
};

Given('{string} has logged in', async function (this: CustomWorld, username: string) {
  const context = await this.init();
  const page = await context.newPage();
  const loginPage = new LoginPage({ page });
  const creds = userCredentials[username];
  if (!creds) {
    throw new Error(`No credentials found for user: ${username}`);
  }

  await loginPage.gotoLoginPage();
  await loginPage.login(creds.username, creds.password);
  const storageState = await context.storageState({ path: authUserFile });
  const accessToken = storageState.origins[0].localStorage.find((item) => item.name === 'access_token')?.value;
  const userApi = new Api({
    url: config.CONTROLLER_HOST,
    accessToken: accessToken,
    userName: username,
  });
  this.currentUser = username;
  this.setUsers({ firstname: username, api: userApi, context: context, page: page } as User);
  if (config.browser === 'webkit') {
    await closeWebkitPopUp({ page: page });
  }
});
