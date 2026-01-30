// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { CustomWorld } from '../cucumberWorld';

Given('{string} has opened the Breakout Rooms moderator tool', async function (this: CustomWorld, user: string) {
  await openBreakoutRoomsModeratorTool(this, user);
});

When('{string} opens the Breakout Rooms moderator tool', async function (this: CustomWorld, user: string) {
  await openBreakoutRoomsModeratorTool(this, user);
});

async function openBreakoutRoomsModeratorTool(world: CustomWorld, user: string) {
  const meeting = world.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  const breakoutRoomsPage = await meeting.meetingRoomPage.startBreakoutRoomsModeratorTool();
  meeting.moderatorTools = { breakoutRooms: { breakoutRoomsPage } };
}

When('{string} creates Breakout Rooms with random distribution', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startBreakoutRooms(true);
});

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
    const breakoutRoomsPage = meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    await breakoutRoomsPage?.setSelectionMode(selectedOption);
  }
);

When(
  /^"([^"]*)" (enables|disables) "Random distribution" in the Breakout Rooms moderator tool$/,
  async function (this: CustomWorld, user: string, action: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const breakoutRoomsPage = meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    await breakoutRoomsPage?.setRandomDistribution(action === 'enables');
  }
);

Then(
  'all together {int} participants should be in the Breakout Rooms in the meeting room of {string}',
  async function (this: CustomWorld, expectedNoOfParticipants: number, moderator: string) {
    const moderatorPage = this.getStartedMeeting(moderator).meeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const breakoutRoomPage = await moderatorPage.startBreakoutRoomsModeratorTool();
    expect(await breakoutRoomPage.countParticipantsOfAllRooms()).toBe(expectedNoOfParticipants);
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
      case 'heading':
        expect(await moderatorToolsPage?.getHeadingText()).toBe(expectedHeading);
        break;

      case 'sub-heading':
        expect(await moderatorToolsPage?.getSubHeadingText()).toBe(expectedHeading);
        break;

      default:
        throw new Error(`Invalid type ${type}`);
    }
  }
);

Then(
  'the "By number of" setting in the Breakout Rooms moderator tool for {string} should have these options:',
  async function (this: CustomWorld, moderator: string, expectedOptionsTable: DataTable) {
    const breakoutRoomsPage =
      this.getStartedMeeting(moderator).meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    const expectedOptions = [];
    for (let i = 0; i < expectedOptionsTable.raw().length; i++) {
      expectedOptions.push(expectedOptionsTable.raw()[i][0]);
    }
    expect(await breakoutRoomsPage?.getSelectionModeOptions()).toEqual(expectedOptions);
  }
);

Then(
  'these settings should be set in the Breakout Rooms moderator tool for {string}',
  async function (this: CustomWorld, moderator: string, expectedSettingsTable: DataTable) {
    const expectedSettingsTableHashes = expectedSettingsTable.hashes();
    const meeting = this.getStartedMeeting(moderator).meeting;
    const breakoutRoomsPage = meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    for (let i = 0; i < expectedSettingsTableHashes.length; i++) {
      switch (expectedSettingsTableHashes[i].setting) {
        case 'Duration':
          expect(await breakoutRoomsPage?.getSessionDuration()).toBe(expectedSettingsTableHashes[i].value);
          break;
        case 'By number of':
          expect(await breakoutRoomsPage?.getSelectionMode()).toBe(expectedSettingsTableHashes[i].value);
          break;
        case 'Number of rooms':
          expect(await breakoutRoomsPage?.getNumberOfRooms()).toBe(expectedSettingsTableHashes[i].value);
          break;
        case 'Random distribution':
          if (expectedSettingsTableHashes[i].value === 'enabled') {
            expect(await breakoutRoomsPage?.isDistributionRandom()).toBeTruthy();
          } else if (expectedSettingsTableHashes[i].value === 'disabled') {
            expect(await breakoutRoomsPage?.isDistributionRandom()).toBeFalsy();
          } else {
            throw new Error('Invalid value for "Random distribution" setting');
          }
          break;
        default:
          throw new Error('Invalid Setting name for the Breakout Rooms moderator tool');
      }
    }
  }
);

Then(
  '{int} rooms to be created should be displayed in the Breakout Rooms moderator tool for {string}',
  async function (this: CustomWorld, expectedNoOfRooms: number, moderator: string) {
    const breakoutRoomsPage =
      this.getStartedMeeting(moderator).meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    expect(await breakoutRoomsPage?.getNumberOfRoomsToBeCreated()).toBe(expectedNoOfRooms);
  }
);

Then(
  'a {string} button should be displayed in the Breakout Rooms moderator tool for {string}',
  async function (this: CustomWorld, buttonName: string, moderator: string) {
    const breakoutRoomsPage =
      this.getStartedMeeting(moderator).meeting.moderatorTools?.breakoutRooms?.breakoutRoomsPage;
    if (!breakoutRoomsPage) {
      throw new Error('Breakout rooms moderator tool has not been opened yet');
    }
    switch (buttonName.toLowerCase()) {
      case 'start rooms':
        await expect(breakoutRoomsPage.startRoomsButton).toBeVisible();
        break;
      case 'close room':
        await expect(breakoutRoomsPage.closeRoomButton).toBeVisible();
        break;
      default:
        throw new Error('Invalid button name for the Breakout Rooms moderator tool');
    }
  }
);
