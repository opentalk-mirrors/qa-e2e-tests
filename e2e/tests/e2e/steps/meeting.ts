// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { getClipboardContent } from '../../helper/clipboardHelpers';
import { substituteInLineCodes } from '../../helper/helper';
import {
  joinMeetingRoomAsGuest,
  joinMeetingRoomWithNGuests,
  startAdhocMeetingAsModerator,
} from '../../helper/meetingHelpers';
import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { InviteGuestPopupPage } from '../../pages/MeetingRoom/InviteGuestPopupPage';
import { CustomWorld } from '../cucumberWorld';

Given(
  '{string} has started an ad-hoc meeting and joined the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    await startAdhocMeeting(this, username);
  }
);
When(
  '{string} starts an ad-hoc meeting and joins the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    await startAdhocMeeting(this, username);
  }
);

When(
  '{int} guests join the meeting of {string}',
  async function (this: CustomWorld, numOfGuests: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const guestRooms = await joinMeetingRoomWithNGuests(
      this.page,
      this.context,
      meeting.guestLink,
      'guest',
      numOfGuests
    );
    this.addGuestMeetingRooms(user, guestRooms);
  }
);

When('{string} creates a guest link from the more-options menu', async function (this: CustomWorld, user: string) {
  const moreOptionsPage = await this.getStartedMeeting(user).meeting.meetingRoomPage.showMoreOptions();
  const inviteGuestPopupPage = await moreOptionsPage.inviteGuest();
  await inviteGuestPopupPage.createInvitation();
});

When(
  '{string} closes all open dialogs by pressing Escape {int} times',
  async function (this: CustomWorld, user: string, countPressing: number) {
    const meetingRoomPage = this.getStartedMeeting(user).meeting.meetingRoomPage;
    await meetingRoomPage.page.bringToFront();
    for (let i = 0; i < countPressing; i++) {
      await meetingRoomPage.pressEscape();
      await waitForDomStopChanging(meetingRoomPage.page);
    }
  }
);

When('{string} copies the guest link into the clipboard', async function (this: CustomWorld, user: string) {
  const inviteGuestPopupPage = new InviteGuestPopupPage(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
  await inviteGuestPopupPage.copyToClipboard();
});

When(
  'a guest joins the meeting using the link in the clipboard of {string}',
  async function (this: CustomWorld, user: string) {
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    const guestRoom = await joinMeetingRoomAsGuest(this.context, clipboardContent, 'guest_joined_inside_breakout_room');
    this.addGuestMeetingRooms(user, [guestRoom]);
  }
);

Then(
  /^(\d+) participants? should be in the (?:meeting|breakout) room of "([^"]*)"$/,

  async function (this: CustomWorld, expectedNumOfParticipants: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectModeratorToolHome();
    const actualNumOfParticipants = await meeting.meetingRoomPage.getNumberOfParticipantsInMeeting();
    expect(actualNumOfParticipants).toBe(expectedNumOfParticipants);
  }
);

Then(
  'the content of the clipboard of {string} should match {string}',
  async function (this: CustomWorld, user: string, regexToMatch: string) {
    regexToMatch = substituteInLineCodes(regexToMatch);
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    expect(clipboardContent).toMatch(new RegExp(regexToMatch));
  }
);

async function startAdhocMeeting(world: CustomWorld, username: string) {
  if (world.currentUser !== username) {
    throw new Error(`Expected ${username} but current user is ${world.currentUser}`);
  }
  world.setStartedMeeting(username, await startAdhocMeetingAsModerator(world.page));
}
