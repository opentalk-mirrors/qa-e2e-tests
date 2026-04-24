// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, BrowserContext, TestInfo } from '@playwright/test';
import path from 'path';

import { config } from './config';
import { initializeUser, userCredentials } from './helper/keycloak';
import { LoginPage } from './pages/LoginPage';

export let authUserFile: string;

export async function globalSetup(page: Page, context: BrowserContext, testInfo: TestInfo): Promise<string> {
  const userId = await initializeUser(userCredentials['Alice'], testInfo.workerIndex);
  const loginPage = new LoginPage({ page });
  await loginPage.gotoLoginPage();
  await loginPage.login(`${config.USER_NAME}_${testInfo.workerIndex}`, config.PASSWORD);
  authUserFile = path.resolve('.auth/user' + testInfo.workerIndex + '.json');
  await context.storageState({ path: authUserFile });
  return userId;
}
