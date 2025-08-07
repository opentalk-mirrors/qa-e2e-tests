// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { chromium } from '@playwright/test';
import path from 'path';

import { config } from './config';
import { changeLanguage } from './helper/Api';
import { LoginPage } from './pages/LoginPage';

export const authUserFile = path.resolve('.auth/user.json');

export async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.gotoLoginPage();
  await loginPage.login(config.USERNAME, config.PASSWORD);

  await context.storageState({ path: authUserFile });

  await changeLanguage('en-US');

  await browser.close();
}
