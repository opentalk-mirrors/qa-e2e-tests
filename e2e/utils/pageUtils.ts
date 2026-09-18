// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

import { config } from '../tests/config';

/**
 * Go to the dashboard
 */
export const gotoDashboard = async (page: Page): Promise<void> => {
  await page.goto(config.INSTANCE_URL);
};

/**
 * Go to the meeting lobby
 */
export const gotoLobby = async (page: Page, roomURL: string): Promise<void> => {
  await page.goto(roomURL);
  await page.waitForTimeout(1000);
};

/**
 * Go to the room
 */
export const gotoRoom = async (page: Page, roomURL: string): Promise<void> => {
  await gotoLobby(page, roomURL);
  await page.getByRole('button', { name: 'Enter now' }).click();
  await page.waitForTimeout(500);
};

/**
 * Creates an adhoc meeting
 *
 * Navigates to the dashboard and creates an adhocmeeting
 *
 * @return link to the adhoc meeting
 */
export const createAdhocMeeting = async (page: Page): Promise<string> => {
  await gotoDashboard(page);
  await page.getByRole('link', { name: 'Start new' }).click();
  return await page.getByLabel('Meeting-Link').inputValue();
};
