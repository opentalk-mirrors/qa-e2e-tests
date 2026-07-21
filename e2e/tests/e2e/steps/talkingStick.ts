//  SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
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
    assert(
      talkingStickPage.dropdownMenuItem,
      'toBeVisible',
      undefined,
      'Expected the order selection dropdown menu to be visible in the Talking Stick moderator tool'
    );
  }
);

Then(
  'the order selection dropdown should not be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    assert(
      talkingStickPage.dropdownMenuItem,
      'toBeHidden',
      undefined,
      'Expected the order selection dropdown menu to be hidden in the Talking Stick moderator tool'
    );
  }
);

Then(
  'the order selection field with the {string} button should be displayed in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, optionButton: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const optionButtonList = talkingStickPage.getOrderSelectionOptionLocator(optionButton);
    assert(
      optionButtonList,
      'toBeVisible',
      undefined,
      `Expected the "${optionButton}" order selection option to be visible in the Talking Stick moderator tool`
    );
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
        assert(
          displayGuestNames,
          'toEqual',
          expectedOrder,
          'Expected the participants to be displayed in descending alphabetical order'
        );
        break;
      }
      case 'Ascending': {
        const expectedOrder = [...displayGuestNames].sort();
        assert(
          displayGuestNames,
          'toEqual',
          expectedOrder,
          'Expected the participants to be displayed in ascending alphabetical order'
        );
        break;
      }
      case 'First Join Time': {
        const expectedOrder = [...displayGuestTimes].sort();
        assert(
          displayGuestTimes,
          'toEqual',
          expectedOrder,
          'Expected the participants to be ordered by first join time'
        );
        break;
      }
      case 'Last Join Time': {
        const expectedOrder = [...displayGuestTimes].sort().reverse();
        assert(
          displayGuestTimes,
          'toEqual',
          expectedOrder,
          'Expected the participants to be ordered by last join time'
        );
        break;
      }
      default:
        throw new Error(`Invalid displayOrder: ${displayOrder}`);
    }
  }
);

Then(
  '"Include moderator" should be switched ON in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const moderatorSwitch = await talkingStickPage.getIncludeModeratorSwitchValue();
    assert(moderatorSwitch, 'toBeTruthy', undefined, 'Expected the "Include moderator" switch to be enabled');
  }
);

Then(
  'the participants joined time should have the format “Joined HH:MM” in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    const displayGuestTimes = await talkingStickPage.getParticipantData('time');
    const expectedFormatRegex = /^Joined (?:[01]\d|2[0-3]):[0-5]\d$/;
    for (const timeString of displayGuestTimes) {
      assert(timeString, 'toMatch', expectedFormatRegex, `Expected "${timeString}" to match the format "Joined HH:MM"`);
    }
  }
);

Then(
  'the audio status for each participant in the Meeting room should be turned off by default in the Talking Stick moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const talkingStickPage = new TalkingStickPage(meeting.meetingRoomPage);
    await assert(
      talkingStickPage.activeSpeakerSVG,
      'not toBeVisible',
      undefined,
      'Expected each participant to display the default muted audio status in the Talking Stick moderator tool'
    );
  }
);
