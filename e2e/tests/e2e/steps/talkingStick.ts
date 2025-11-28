//  SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { TalkingStickPage } from '../../pages/MeetingRoom/ModeratorTools/TalkingStickPage';
import { CustomWorld } from '../cucumberWorld';

When('{string} opens the Talking Stick moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startTalkingStickModeratorTool();
});

When(
  '{string} shows the possible order selections in the Talking Stick moderator tool',
  async function (this: CustomWorld, moderator: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    await talkingStickPage.showPossibleOrderSelections();
  }
);

When(
  '{string} orders the participants by {string} in the Talking Stick moderator tool',
  async function (this: CustomWorld, moderator: string, order: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    await talkingStickPage.selectOrderSelection(order);
  }
);

Then(
  'the order selection dropdown menu should be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    await expect(talkingStickPage.dropdownMenuItem).toBeVisible();
  }
);

Then(
  'the order selection dropdown should not be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    await expect(talkingStickPage.dropdownMenuItem).not.toBeVisible();
  }
);

Then(
  'the order selection field with the {string} button should be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, optionButton: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const optionButtonList = talkingStickPage.getOrderSelectionOptionLocator(optionButton);
    await expect(optionButtonList).toBeVisible();
  }
);

Then(
  'the participants list should be displayed in {string} order in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, displayOrder: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const displayGuestNames = await talkingStickPage.getParticipantData('name');
    const displayGuestTimes = await talkingStickPage.getParticipantData('time');
    switch (displayOrder) {
      case 'Descending': {
        const expectedOrder = [...displayGuestNames].sort().reverse();
        expect(displayGuestNames).toEqual(expectedOrder);
        break;
      }
      case 'Ascending': {
        const expectedOrder = [...displayGuestNames].sort();
        expect(displayGuestNames).toEqual(expectedOrder);
        break;
      }
      case 'First Join Time': {
        const expectedOrder = [...displayGuestTimes].sort();
        expect(displayGuestTimes).toEqual(expectedOrder);
        break;
      }
      case 'Last Join Time': {
        const expectedOrder = [...displayGuestTimes].sort().reverse();
        expect(displayGuestTimes).toEqual(expectedOrder);
        break;
      }
      default:
        throw new Error(`Invalid displayOrder: ${displayOrder}`);
    }
  }
);

Then(
  '{int} participants should be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, guestCount: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const displayGuestCount = talkingStickPage.getTotalParticipantsNumber();
    expect(guestCount).toEqual(await displayGuestCount);
  }
);
