// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { validateDataTableHeaders } from '../../helper/helper';
import { PollPage } from '../../pages/MeetingRoom/ModeratorTools/PollPage';
import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { CustomWorld } from '../cucumberWorld';

Given(
  '{string} has opened the Poll Moderator Tool in the meeting room',
  async function (this: CustomWorld, user: string) {
    await openPollModeratorTool(this, user);
  }
);

When('{string} opens the Poll Moderator Tool in the meeting room', async function (this: CustomWorld, user: string) {
  await openPollModeratorTool(this, user);
});

async function openPollModeratorTool(world: CustomWorld, user: string): Promise<void> {
  const meeting = world.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startPollModeratorTool();
}

Then(
  'the following description should be displayed in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, description: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await assert(
      pollPage.emptyPollMessage,
      'toHaveText',
      description,
      `Expected description '${description}' to be present in locator ${pollPage.emptyPollMessage}`
    );
  }
);

When(
  /^"([^"]*)" (?:starts|has started) to create a new poll in the open moderator tool$/,
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await pollPage.createNewPollRoom();
  }
);

When('{string} exits the Create Poll moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
  await pollPage.exitPollRoomCreation();
});

Then(
  'the following settings should be set for {string} in the Create Poll moderator tool:',
  async function (this: CustomWorld, user: string, settingTable: DataTable) {
    const expectedHeaders = ['setting', 'value'];
    validateDataTableHeaders(settingTable, expectedHeaders);
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    const settings = await pollPage.getCurrentSettings();
    const settingMap: Record<string, keyof typeof settings> = {
      live: 'isLive',
      'multiple choice': 'allowMultipleChoice',
    };
    const settingDetails = settingTable.hashes();

    for (const row of settingDetails) {
      const property = settingMap[row['setting']];
      if (!property) {
        throw new Error(`Unsupported expected setting: "${row['setting']}"`);
      }
      const expectedValue = row['value'] === 'true';
      await assert(
        settings[property],
        'toBe',
        expectedValue,
        `Expected "${row['setting']}" setting to be ${expectedValue} but got ${settings[property]}`
      );
    }
  }
);

When(
  /^"([^"]*)" (creates|updates) (?:a new|the currently open) poll with the following details in the Create Poll moderator tool$/,
  async function (this: CustomWorld, user: string, action: string, pollDetailTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });

    const expectedHeaders = ['field', 'value'];
    validateDataTableHeaders(pollDetailTable, expectedHeaders);

    const rows = pollDetailTable.hashes();

    for (const row of rows) {
      const field = row['field'];
      const value = row['value'];

      if (field === 'Topic') {
        await pollPage.enterTopicValue(value);
      } else if (field.includes('Option')) {
        const optionIndex = pollPage.getOptionIndex(field);
        if (action === 'creates') {
          await pollPage.fillOption(optionIndex, value);
        } else {
          await pollPage.updateOption(optionIndex, value);
        }
      } else {
        throw new Error(`Unsupported field in poll table: "${field}"`);
      }
    }
    await pollPage.saveAsTemplate();
    await pollPage.exitPollRoomCreation();
  }
);

When(
  '{string} removes the second-to-last poll option in the Create Poll moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await pollPage.removeOptionFromEnd(1); // 1 = second-last option
    await pollPage.saveAsTemplate();
  }
);

Then(
  '{int} created poll(?:s) should be listed in the open moderator tool for {string}',
  async function (this: CustomWorld, pollCount: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    const existingPolls = await pollPage.getExistingPolls();
    await assert(
      existingPolls,
      'toBe',
      pollCount,
      `Expected ${pollCount} created poll(s) to be listed but got ${existingPolls}`
    );
  }
);

Then(
  /^"([^"]*)" selects the latest (?:created|updated) poll in the open moderator tool$/,
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    await pollPage.selectLatestPoll();
  }
);

Then(
  'the poll should be displayed with the following details for {string}',
  async function (this: CustomWorld, user: string, savedPollTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    const pollPage = new PollPage({ page: meeting.meetingRoomPage.page });
    const expectedHeaders = ['field', 'value'];
    validateDataTableHeaders(savedPollTable, expectedHeaders);
    const polls = savedPollTable.hashes();

    let optionCounter = 0;

    for (const row of polls) {
      const field = row.field;
      const expectedValue = row.value;

      if (field === 'Topic') {
        await assert(await pollPage.createNewPoll.topicField.inputValue(), 'toBe', expectedValue, `Expected topic field to have value "${expectedValue}"`);
      } else if (field.includes('Option')) {
        const option = pollPage.getOptionByIndex(optionCounter);
        await assert(await option.textContent(), 'toHaveText', expectedValue, `Expected option ${optionCounter + 1} to have value "${expectedValue}"`);

        optionCounter++;
      } else {
        throw new Error(`Unsupported field in poll table: "${field}"`);
      }
    }
  }
);

Then(
  'these poll details for {string} should be displayed in the following order in the open moderator tool:',
  async function (this: CustomWorld, user: string, detailsTabel: DataTable) {
    const expectedHeaders = ['field', 'value'];
    validateDataTableHeaders(detailsTabel, expectedHeaders);
    const expected = detailsTabel.hashes();

    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });

    const actual = await moderatorToolPage.getSavedDetails();

    for (let i = 0; i < expected.length; i++) {
      const [topic] = actual[i];
      const rowNumber = i + 1;
      await assert(
        topic,
        'toBe',
        expected[i].value,
        `Poll row ${rowNumber}: topic mismatch. Expected "${expected[i].topic}", but found "${topic}".`
      );
    }
  }
);
