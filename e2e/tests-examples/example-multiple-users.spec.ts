// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { createPageContextWithMultipleUsers } from '../utils/pageUtils';

const USER_AMOUNT = 8;

test.describe.configure({ mode: 'serial', timeout: 120_000, retries: 2 });

test.describe('example for join a conference with multiple users', () => {
  test.beforeEach(async ({ page, context }) => {
    await createPageContextWithMultipleUsers({
      page,
      context,
      userAmount: USER_AMOUNT,
    });
  });

  test('test', async ({ page }) => {
    const pagePromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Open Video Room' }).click();
    const roomPage = await pagePromise;
    await expect(roomPage.getByRole('button', { name: 'Enter now' })).toBeVisible();
    await roomPage.getByRole('button', { name: 'Enter now' }).click();
    await expect(roomPage.getByTestId('ParticipantWindow')).toHaveCount(USER_AMOUNT);
  });
});
