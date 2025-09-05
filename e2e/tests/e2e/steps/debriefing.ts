// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { DebriefingPage } from '../../pages/MeetingRoom/ModeratorTools/DebriefingPage';
import { CustomWorld } from '../cucumberWorld';

let debriefingPage: DebriefingPage;

When('{string} clicks on "Debriefing" button', async function (this: CustomWorld, username: string) {
  if (this.currentUser !== username) {
    throw new Error(`Step user mismatch: expected ${username}, got ${this.currentUser}`);
  }
  const meeting = this.getStartedMeeting(username).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  debriefingPage = new DebriefingPage(this.page);
  await debriefingPage.startDebriefingModeratorTool();
});

Then('for {string} the debriefing option should be displayed', async function (this: CustomWorld, username: string) {
  if (this.currentUser !== username) {
    throw new Error(`Step user mismatch: expected ${username}, got ${this.currentUser}`);
  }

  await expect(debriefingPage.debriefingOptions.forModeratorOption).toBeVisible();
});
