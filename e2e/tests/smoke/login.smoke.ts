// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test } from '@playwright/test';

import { config } from '../config';
import { assert } from '../helper/assertion';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

// prevent from auto login for testing
test.use({ storageState: { cookies: [], origins: [] } });

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage({ page });
  await loginPage.gotoLoginPage();
});

test('Login with valid credentials (username)', async ({ page }) => {
  await loginPage.login(config.USER_NAME, config.PASSWORD);
  await assert(
    new HomePage({ page }).startNewMeetingButton,
    'toBeVisible',
    undefined,
    'Start New Meeting button is not visible after successful login with username'
  );
});

test('Login with valid credentials (email)', async ({ page }) => {
  await loginPage.login(config.USER_EMAIL.replace('%s', ''), config.PASSWORD);
  await assert(
    new HomePage({ page }).startNewMeetingButton,
    'toBeVisible',
    undefined,
    'Start New Meeting button is not visible after successful login with email'
  );
});

test('Login with invalid credentials', async () => {
  await loginPage.login(config.USER_NAME, 'wrong_password');
  await assert(
    loginPage.invalidCredentialsError,
    'toBeVisible',
    undefined,
    'Invalid credentials error message is not displayed after login with invalid credentials'
  );
});
