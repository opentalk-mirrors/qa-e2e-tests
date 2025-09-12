// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { NotificationPage } from '../../pages/NotificationPage';
import { CustomWorld } from '../cucumberWorld';

When('{string} creates breakout rooms with random distribution', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startBreakoutRooms(true);
});

When(
  'all participants in the meeting room of {string} join the breakout rooms',
  async function (this: CustomWorld, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    const moderatorPage = startedMeeting.meeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const moderatorNotification = new NotificationPage({ page: moderatorPage.page });
    await moderatorNotification.joinBreakoutRoom();
    for (const guestPage of startedMeeting.guestMeetingRoomPages) {
      const guestNotification = new NotificationPage({ page: guestPage.page });
      await guestPage.page.bringToFront();
      await guestNotification.joinBreakoutRoom();
    }
  }
);

When('{string} closes the breakout rooms', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  const breakoutRoomPage = await meeting.meetingRoomPage.startBreakoutRoomsModeratorTool();
  await breakoutRoomPage.closeRoom();
});

When(
  'all participants in the meeting room of {string} leave the breakout rooms',
  async function (this: CustomWorld, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    const moderatorPage = startedMeeting.meeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const moderatorNotification = new NotificationPage({ page: moderatorPage.page });
    await moderatorNotification.leaveBreakoutRoom();
    for (const guestPage of startedMeeting.guestMeetingRoomPages) {
      const guestNotification = new NotificationPage({ page: guestPage.page });
      await guestPage.page.bringToFront();
      await guestNotification.leaveBreakoutRoom();
    }
  }
);

Then(
  'all together {int} participants should be in the breakout rooms in the meeting room of {string}',
  async function (this: CustomWorld, expectedNoOfParticipants: number, moderator: string) {
    const moderatorPage = this.getStartedMeeting(moderator).meeting.meetingRoomPage;
    await moderatorPage.page.bringToFront();
    const breakoutRoomPage = await moderatorPage.startBreakoutRoomsModeratorTool();
    expect(await breakoutRoomPage.countParticipantsOfAllRooms()).toBe(expectedNoOfParticipants);
  }
);
