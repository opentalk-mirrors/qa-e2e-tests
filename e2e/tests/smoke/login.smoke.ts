// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { config } from '../config';

// prevent from auto login for testing
test.use({ storageState: { cookies: [], origins: [] } });

test('Login with valid credentials (username)', async ({ page }) => {
  await page.goto(config.INSTANCE_URL);
  await page.getByRole('button', { name: /^(Anmelden|Sign In)$/ }).isVisible();
  await page.getByRole('textbox', { name: 'Username or email' }).fill(config.USERNAME);
  await page.getByRole('textbox', { name: 'Username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(config.PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('link', { name: /Start new|Starten/ })).toBeVisible();
});

test('Login with valid credentials (email)', async ({ page }) => {
  await page.goto(config.INSTANCE_URL);
  await page.getByRole('button', { name: /^(Anmelden|Sign In)$/ }).click();
  await page.getByRole('textbox', { name: 'Username or email' }).fill(config.USER_EMAIL);
  await page.getByRole('textbox', { name: 'Username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(config.PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('link', { name: /(Start new|Starten)$/ })).toBeVisible();
});

test('Login with invalid credentials', async ({ page }) => {
  await page.goto(config.INSTANCE_URL);
  await page.getByRole('button', { name: /^(Anmelden|Sign In)$/ }).click();
  await page.getByRole('textbox', { name: 'Username or email' }).fill(config.USERNAME);
  await page.getByRole('textbox', { name: 'Username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('wrong_password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Invalid username or password.')).toBeVisible();
});
