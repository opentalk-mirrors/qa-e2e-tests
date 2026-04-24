// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given, DataTable } from '@cucumber/cucumber';

import { Api } from '../../helper/Api';
import { initializeUser, getAccessTokenOfUser, userCredentials } from '../../helper/keycloak';
import { CustomWorld, User } from '../cucumberWorld';

Given('user {string} has been created', async function (this: CustomWorld, username: string): Promise<void> {
  await createUser(this, username);
});

Given('these users have been created:', async function (this: CustomWorld, users: DataTable): Promise<void> {
  const expectedDetails = users.raw().map(([value]) => value);
  for (let i = 0; i < expectedDetails.length; i++) {
    await createUser(this, expectedDetails[i]);
  }
});

async function createUser(world: CustomWorld, username: string): Promise<void> {
  const creds = userCredentials[username];
  let userId;
  if (world.testId !== undefined) {
    userId = await initializeUser(creds, world.testId);
  }
  const context = await world.init();
  const page = await context.newPage();
  if (!creds) {
    throw new Error(`No credentials found for user: ${username}`);
  }
  const token = await getAccessTokenOfUser(username, creds.password);
  const userApi = new Api({
    accessToken: token,
    userName: `${creds.username}_${world.testId}`,
    password: creds.password,
  });
  world.setUsers({
    firstname: username,
    userName: `${creds.username}_${world.testId}`,
    password: creds.password,
    id: userId,
    api: userApi,
    context: context,
    page: page,
    type: 'user',
  } as User);
}
