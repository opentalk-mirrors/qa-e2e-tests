// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';

import { config } from '../../config';
import { assert } from '../../helper/assertion';
import { validateDataTableHeaders } from '../../helper/helper';
import { BreakoutRoomsPage } from '../../pages/MeetingRoom/ModeratorTools/BreakoutRoomsPage';
import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { CustomWorld } from '../cucumberWorld';

const breakoutRoomAlocationTimeoutInS = 60;

Given('{string} has opened the Breakout Rooms moderator tool', async function (this: CustomWorld, user: string) {
  await openBreakoutRoomsModeratorTool(this, user);
});

When('{string} opens the Breakout Rooms moderator tool', async function (this: CustomWorld, user: string) {
  await openBreakoutRoomsModeratorTool(this, user);
});

async function openBreakoutRoomsModeratorTool(world: CustomWorld, user: string) {
  const meeting = world.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startBreakoutRoomsModeratorTool();
}

When(
  /^"([^"]*)" (tries to create|creates) Breakout Rooms with these settings:$/,
  async function (
    this: CustomWorld,
    moderator: string,
    action: string,
    expectedSettingsTable: DataTable
  ): Promise<void> {
    const expectedHeaders = ['setting', 'value'];
    validateDataTableHeaders(expectedSettingsTable, expectedHeaders);
    const expectedSettings = expectedSettingsTable.hashes();

    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const breakoutRoomPage = await meeting.meetingRoomPage.startBreakoutRoomsModeratorTool();

    let randomDistribution: undefined | boolean;
    for (let i = 0; i < expectedSettings.length; i++) {
      switch (expectedSettings[i].setting) {
        case 'By number of':
          await breakoutRoomPage.setSelectionMode(expectedSettings[i].value);
          break;
        case 'Min. participants':
          await breakoutRoomPage.enterFieldValue(expectedSettings[i].setting, expectedSettings[i].value);
          // get out of the input field, so that the automation to reset the field to correct
          // values will run
          await breakoutRoomPage.heading.click();
          break;
        case 'Random distribution':
          if (expectedSettings[i].value === 'enabled') {
            randomDistribution = true;
          } else if (expectedSettings[i].value === 'disabled') {
            randomDistribution = false;
          } else {
            throw new Error('Invalid value for "Random distribution" setting');
          }
          await breakoutRoomPage.setSwitch(expectedSettings[i].setting, randomDistribution);
          break;
        default:
          throw new Error('Invalid Setting name for the Breakout Rooms moderator tool');
      }
    }

    let allowToFail = false;
    if (action === 'tries to create') {
      allowToFail = true;
    }

    try {
      const timeout = allowToFail ? config.SHORT_TIMEOUT : config.MEDIUM_TIMEOUT;
      await breakoutRoomPage.startRooms(timeout);
    } catch (e) {
      if (!allowToFail) {
        throw e;
      }
    }
  }
);

When(
  'all participants in the meeting room of {string} join the Breakout Rooms',
  async function (this: CustomWorld, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    for (const [_, participantPage] of Object.entries(startedMeeting.participantMeetingRoomPages)) {
      const participantNotification = new NotificationPage({ page: participantPage.page });
      await participantPage.page.bringToFront();
      await participantNotification.joinBreakoutRoom();
    }
  }
);

When(
  /^(\d?) of the participants in the meeting room of "([^"]*)" (join|leave) the Breakout Rooms$/,
  async function (this: CustomWorld, participantCount: number, moderator: string, action: string) {
    const startedMeeting = this.getStartedMeeting(moderator);

    let i = 1;
    for (const participantName in startedMeeting.participantMeetingRoomPages) {
      if (i > participantCount) {
        break;
      }
      i++;
      const participantPage = startedMeeting.participantMeetingRoomPages[participantName];
      if (!participantPage) {
        throw new Error(`Participant "${participantName}" not found in meeting room of "${moderator}"`);
      }
      const participantNotification = new NotificationPage({ page: participantPage.page });
      await participantPage.page.bringToFront();
      if (action === 'join') {
        await participantNotification.joinBreakoutRoom();
      } else if (action === 'leave') {
        await participantNotification.leaveBreakoutRoom();
      }
    }
  }
);

When('{string} closes the Breakout Rooms', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  const breakoutRoomPage = await meeting.meetingRoomPage.startBreakoutRoomsModeratorTool();
  await breakoutRoomPage.closeRoom();
});

When(
  'all participants in the meeting room of {string} leave the Breakout Rooms',
  async function (this: CustomWorld, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    for (const [_, participantPage] of Object.entries(startedMeeting.participantMeetingRoomPages)) {
      const participantNotification = new NotificationPage({ page: participantPage.page });
      await participantPage.page.bringToFront();
      await participantNotification.leaveBreakoutRoom();
    }
  }
);

When(
  '{string} selects {string} for the "By number of" setting',
  async function (this: CustomWorld, user: string, selectedOption: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    await breakoutRoomsPage?.setSelectionMode(selectedOption);
  }
);

When(
  /^"([^"]*)" (enables|disables) "Random distribution" in the Breakout Rooms moderator tool$/,
  async function (this: CustomWorld, user: string, action: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    await breakoutRoomsPage?.setRandomDistribution(action === 'enables');
  }
);

Then(
  /^all together (\d+) participants should be in the Breakout Rooms? in the meeting room of "([^"]*)"$/,
  async function (this: CustomWorld, expectedNoOfParticipants: number, moderator: string) {
    const moderatorPage = this.getStartedMeeting(moderator).meeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const breakoutRoomPage = await moderatorPage.startBreakoutRoomsModeratorTool();
    const noOfParticipants = await breakoutRoomPage.countParticipantsOfAllRooms();
    await assert(
      noOfParticipants,
      'toBe',
      expectedNoOfParticipants,
      `Expected to have ${expectedNoOfParticipants} participants but found ${noOfParticipants} participants`
    );
  }
);

Then(
  /the "([^"]*)" in the open moderator tool for "([^"]*)" should be "([^"]*)"/,
  async function (this: CustomWorld, type: string, moderator: string, expectedHeading: string) {
    const startedMeeting = this.getStartedMeeting(moderator).meeting;
    const moderatorPage = startedMeeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: moderatorPage.page });
    switch (type) {
      case 'heading': {
        const headingText = await moderatorToolsPage?.getHeadingText();
        await assert(
          headingText,
          'toBe',
          expectedHeading,
          `Expected to have ${expectedHeading} but found ${headingText} in the heading`
        );
        break;
      }
      case 'sub-heading': {
        const subHeadingText = await moderatorToolsPage?.getSubHeadingText();
        await assert(
          subHeadingText,
          'toBe',
          expectedHeading,
          `Expected to have ${expectedHeading} but found ${subHeadingText} in the sub-heading`
        );
        break;
      }
      default:
        throw new Error(`Invalid type ${type}`);
    }
  }
);

Then(
  'the "By number of" setting in the Breakout Rooms moderator tool for {string} should have these options:',
  async function (this: CustomWorld, moderator: string, expectedOptionsTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    const expectedOptions = expectedOptionsTable.raw().map(([value]) => value);
    const selectionModeOptions = await breakoutRoomsPage?.getSelectionModeOptions();
    await assert(
      selectionModeOptions,
      'toEqual',
      expectedOptions,
      `Expected to have ${expectedOptions} but found ${selectionModeOptions} in the options`
    );
  }
);

Then(
  'these settings should be set in the Breakout Rooms moderator tool for {string}',
  async function (this: CustomWorld, moderator: string, expectedSettingsTable: DataTable) {
    const expectedHeaders = ['setting', 'value'];
    validateDataTableHeaders(expectedSettingsTable, expectedHeaders);
    const expectedSettings = expectedSettingsTable.hashes();
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    for (let i = 0; i < expectedSettings.length; i++) {
      switch (expectedSettings[i].setting) {
        case 'Duration': {
          const sessionDuration = await breakoutRoomsPage?.getSessionDuration();
          await assert(
            sessionDuration,
            'toBe',
            expectedSettings[i].value,
            `Expected to have duration of ${expectedSettings[i].value} but found ${sessionDuration}`
          );
          break;
        }
        case 'By number of': {
          const selectionMode = await breakoutRoomsPage?.getSelectionMode();
          await assert(
            selectionMode,
            'toBe',
            expectedSettings[i].value,
            `Expected ${expectedSettings[i].value} to be selected but found ${selectionMode} to be selected`
          );
          break;
        }
        case 'Number of rooms':
        case 'Min. participants': {
          const actual = await breakoutRoomsPage?.getFieldInputValue(expectedSettings[i].setting);
          await assert(
            actual,
            'toBe',
            expectedSettings[i].value,
            `Expected to have ${expectedSettings[i].value} for ${expectedSettings[i].setting} but found ${actual}`
          );
          break;
        }
        case 'Random distribution': {
          const isDistributionRandom = await breakoutRoomsPage?.isDistributionRandom();
          if (expectedSettings[i].value === 'enabled') {
            await assert(
              isDistributionRandom,
              'toBeTruthy',
              `Expected Random distribution to be enabled but it was disabled`
            );
          } else if (expectedSettings[i].value === 'disabled') {
            await assert(
              isDistributionRandom,
              'toBeFalsy',
              `Expected Random distribution to be disabled but it was enabled`
            );
          } else {
            throw new Error('Invalid value for "Random distribution" setting');
          }
          break;
        }
        default:
          throw new Error('Invalid Setting name for the Breakout Rooms moderator tool');
      }
    }
  }
);

Then(
  'a {string} button should be displayed in the Breakout Rooms moderator tool for {string}',
  async function (this: CustomWorld, buttonName: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    if (!breakoutRoomsPage) {
      throw new Error('Breakout rooms moderator tool has not been opened yet');
    }
    switch (buttonName.toLowerCase()) {
      case 'start rooms':
        await assert(
          breakoutRoomsPage.startRoomsButton,
          'toBeVisible',
          `Expected to have 'start rooms' visible in Breakout Rooms moderator tool`
        );
        break;
      case 'close room':
        await assert(
          breakoutRoomsPage.closeRoomButton,
          'toBeVisible',
          `Expected to have 'close room' visible in Breakout Rooms moderator tool`
        );
        break;
      default:
        throw new Error('Invalid button name for the Breakout Rooms moderator tool');
    }
  }
);
Then(
  /^(\d+) Breakout Rooms should have been created in the meeting room of "([^"]*)"$/,
  async function (this: CustomWorld, expectedNoOfRooms: number, moderator: string): Promise<void> {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    const createdRooms = await breakoutRoomsPage?.countCreatedRooms();
    await assert(
      createdRooms,
      'toBe',
      expectedNoOfRooms,
      `Expected to have ${expectedNoOfRooms} rooms but found ${createdRooms} rooms`
    );
  }
);

When(
  /^"([^"]*)" waits for the participants to be (?:allocated|moved) to the (?:Main Room|Breakout Rooms)$/,
  async function (this: CustomWorld, moderator: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const page = meeting.meetingRoomPage.page;
    await page.waitForTimeout(breakoutRoomAlocationTimeoutInS * 1000);
  }
);
Then(
  /^(?:these|this) error messages? should be shown to "([^"]*)" in the Breakout Rooms moderator tool$/,
  async function (this: CustomWorld, moderator: string, expectedErrors: DataTable): Promise<void> {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    if (breakoutRoomsPage === undefined) {
      throw new Error(`Breakout Rooms moderator tool is not open`);
    }
    await breakoutRoomsPage.page.bringToFront();
    const actualErrorMessages = await breakoutRoomsPage.getErrorMessages();
    for (const expectedError of expectedErrors.raw().flat()) {
      await assert(
        actualErrorMessages,
        'toContain',
        expectedError,
        `could not find the error message "${expectedError}"`
      );
    }
  }
);

Then(
  /^these rooms should be listed as to be created in the Breakout Rooms moderator tool of "([^"]*)"$/,
  async function (this: CustomWorld, moderator: string, expectedRoomsTable: DataTable): Promise<void> {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = new BreakoutRoomsPage({ page: meeting.meetingRoomPage.page });
    if (breakoutRoomsPage === undefined) {
      throw new Error(`Breakout Rooms moderator tool is not open`);
    }
    await breakoutRoomsPage.page.bringToFront();
    const rooms = await breakoutRoomsPage.getListOfRoomsToBeCreated();
    for (const expectedRoom of expectedRoomsTable.raw().flat()) {
      await assert(rooms, 'toContain', expectedRoom, `could not find the room "${expectedRoom}"`);
    }
  }
);
