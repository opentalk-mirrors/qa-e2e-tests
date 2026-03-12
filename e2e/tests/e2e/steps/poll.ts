// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { validateDataTableHeaders } from '../../helper/helper';
import { PollPage } from '../../pages/MeetingRoom/ModeratorTools/PollPage';
import { CustomWorld } from '../cucumberWorld';

let pollPage: PollPage;

When('{string} opens the Poll Moderator Tool in the meeting room', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startPollModeratorTool();
});

Then(
  'the following description should be displayed in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, description: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await expect(pollPage.emptyPollMessage).toHaveText(description);
  }
);

When(
  '{string} starts to create a new poll in the open moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await pollPage.createNewPollRoom();
  }
);

When('{string} exits the Create Poll moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
  await pollPage.exitPollRoomCreation();
});

Then(
  'the new poll should have following default settings in the Create Poll moderator tool for {string}',
  async function (this: CustomWorld, user: string, pollTypeTable: DataTable) {
    const expectedHeaders = ['poll-type', 'value'];
    validateDataTableHeaders(pollTypeTable, expectedHeaders);
    const meeting = this.getStartedMeeting(user).meeting;
    pollPage = new PollPage({ page: meeting.meetingRoomPage.page });

    const defaults = await pollPage.getPollDefaults();
    const rows = pollTypeTable.hashes();

    for (const row of rows) {
      const pollType = row['poll-type'];
      const expectedValue = row['value'] === 'true';

      if (pollType === 'live') {
        expect(defaults.isLive).toBe(expectedValue);
      } else if (pollType === 'multiple choice') {
        expect(defaults.allowMultipleChoice).toBe(expectedValue);
      } else {
        throw new Error(`Unknown poll-type: ${pollType}`);
      }
    }
  }
);

Then(
  'no polls should be listed in the open moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    const existingPolls = await pollPage.getExistingPolls();
    expect(existingPolls).toBe(0);
  }
);
