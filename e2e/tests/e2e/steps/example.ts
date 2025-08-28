// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { authUserFile } from '../../authHelpers';
import { config } from '../../config';
import { changeLanguage } from '../../helper/Api';
import { startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { LoginPage } from '../../pages/LoginPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { DebriefingPage } from '../../pages/MeetingRoom/ModeratorTools/DebriefingPage';
import { CustomWorld } from '../cucumberWorld';

let meetingRoomPage: MeetingRoomPage;
let debriefingPage: DebriefingPage;

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
});

Given(
  '{string} has started an ad-hoc meeting and joined the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    if (this.currentUser !== username) {
      throw new Error(`Expected ${username} but current user is ${this.currentUser}`);
    }

    ({ meetingRoomPage } = await startAdhocMeetingAsModerator(this.page));
    await meetingRoomPage.page.bringToFront();
    debriefingPage = new DebriefingPage(this.page);
  }
);

When('{string} clicks on "Debriefing" button', async function (this: CustomWorld, username: string) {
  if (this.currentUser !== username) {
    throw new Error(`Step user mismatch: expected ${username}, got ${this.currentUser}`);
  }

  await debriefingPage.startDebriefingModeratorTool();
});

Then('for {string} the debriefing option should be displayed', async function (this: CustomWorld, username: string) {
  if (this.currentUser !== username) {
    throw new Error(`Step user mismatch: expected ${username}, got ${this.currentUser}`);
  }

  await expect(debriefingPage.debriefingOptions.forModeratorOption).toBeVisible();
});
