// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given } from '@cucumber/cucumber';

import { authUserFile } from '../../authHelpers';
import { config } from '../../config';
import { Api } from '../../helper/Api';
import { userCredentials } from '../../helper/keycloak';
import { closeWebkitPopUp } from '../../helper/webkit';
import { LoginPage } from '../../pages/LoginPage';
import { CustomWorld, User } from '../cucumberWorld';

Given('{string} has logged in', async function (this: CustomWorld, username: string) {
  const creds = userCredentials[username];
  const user = this.getUser(username);
  const page = user.page;
  const loginPage = new LoginPage({ page });
  await loginPage.gotoLoginPage();
  await loginPage.login(user.userName, user.password);
  const storageState = await user.context.storageState({ path: authUserFile });
  const accessToken = storageState.origins[0].localStorage.find((item) => item.name === 'access_token')?.value;
  const userApi = new Api({
    accessToken: accessToken,
    userName: user.userName,
    password: creds.password,
  });
  this.currentUser = user.userName;
  user.api = userApi;
  this.setUsers(user as User);
  if (config.browser === 'webkit') {
    await closeWebkitPopUp({ page: page });
  }
});
