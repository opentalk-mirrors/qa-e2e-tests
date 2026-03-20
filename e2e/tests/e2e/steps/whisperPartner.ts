// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { validateDataTableHeaders } from '../../helper/helper';
import { CustomWorld } from '../cucumberWorld';

When(
  '{string} declines the invitation to a whisper group in the meeting room of {string}',
  async function (this: CustomWorld, user: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    await meeting.participantMeetingRoomPages[user].declineInvitationToWhisperGroup();
  }
);

When(
  '{string} accepts the invitation to a whisper group in the meeting room of {string}',
  async function (this: CustomWorld, user: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    await meeting.participantMeetingRoomPages[user].acceptInvitationToWhisperGroup();
  }
);

When(
  /"([^"]*)" marks "([^"]*)" as whisper partner in the meeting room$/,
  async function (this: CustomWorld, moderator: string, userToMark: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.markAsWhisperPartner(userToMark);
  }
);

Then(
  /for "([^"]*)" these participants should have the following whisper partner status in the meeting room of "([^"]*)":$/,
  async function (this: CustomWorld, user: string, moderator: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    const peopleOptionPage = await meeting.participantMeetingRoomPages[user].selectPeopleOption();
    validateDataTableHeaders(dataTable, ['participant', 'status']);
    for (const { participant, status } of dataTable.hashes()) {
      if (status !== 'confirmed' && status !== 'pending') {
        throw new Error(`Invalid whisper partner status: "${status}". Expected 'confirmed' or 'pending'`);
      }
      await assert(
        peopleOptionPage.getWhisperPartnerStatusLocator(participant, status as 'confirmed' | 'pending'),
        'toBeVisible',
        undefined,
        `whisper partner status for ${participant} is not as expected`
      );
    }
  }
);

When(
  /"([^"]*)" leaves the whisper group in the meeting room of "([^"]*)"$/,
  async function (this: CustomWorld, user: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.leaveWhisperGroup(user);
  }
);

Then(
  /for "([^"]*)" these participants should not be labeled as whisper partners in the meeting room of "([^"]*)":$/,
  async function (this: CustomWorld, user: string, moderator: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    const peopleOptionPage = await meeting.participantMeetingRoomPages[user].selectPeopleOption();
    const participants = dataTable.raw().map(([participant]) => participant);
    const statuses = ['confirmed', 'pending'];
    for (const participant of participants) {
      for (const status of statuses) {
        await assert(
          peopleOptionPage.getWhisperPartnerStatusLocator(participant, status as 'confirmed' | 'pending'),
          'not toBeVisible',
          undefined,
          `whisper partner status for ${participant} should have been removed`
        );
      }
    }
  }
);
