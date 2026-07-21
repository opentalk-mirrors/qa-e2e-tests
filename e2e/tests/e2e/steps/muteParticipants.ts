// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { validateDataTableHeaders } from '../../helper/helper';
import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { MuteParticipantsPage } from '../../pages/MeetingRoom/ModeratorTools/MuteParticipantsPage';
import { ParticipantListWithCheckboxesPage } from '../../pages/MeetingRoom/ModeratorTools/ParticipantListWithCheckboxesPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { CustomWorld } from '../cucumberWorld';

When('{string} opens the Mute Participants moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startMuteParticipantsModeratorTool();
});
When(
  '{string} mutes all participants in the Mute Participants moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const muteParticipantsPage = new MuteParticipantsPage({ page: meeting.meetingRoomPage.page });
    await muteParticipantsPage.muteAllParticipants();
  }
);

When(
  '{string} selects and mutes these participants in the Mute Participants moderator tool:',
  async function (this: CustomWorld, moderator: string, participantsToMuteTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const muteParticipantsPage = new MuteParticipantsPage({ page: meeting.meetingRoomPage.page });
    const participants = participantsToMuteTable.raw().map(([participant]) => participant);
    const participantListWithCheckboxesPage = new ParticipantListWithCheckboxesPage({
      page: meeting.meetingRoomPage.page,
    });
    await participantListWithCheckboxesPage.selectParticipantByNames(participants);
    await muteParticipantsPage.muteSelectedParticipants();
    await waitForDomStopChanging(meeting.meetingRoomPage.page);
  }
);

Then(
  'in the meeting of {string} these alert notifications should be displayed for the respected users:',
  async function (this: CustomWorld, moderator: string, messageTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    const expectedHeaders = ['user', 'text'];
    validateDataTableHeaders(messageTable, expectedHeaders);
    const messages = messageTable.hashes();
    for (const message of messages) {
      if (meeting.participantMeetingRoomPages && meeting.participantMeetingRoomPages[message.user]) {
        await meeting.participantMeetingRoomPages[message.user].page.bringToFront();
        const notificationPage = new NotificationPage({ page: meeting.participantMeetingRoomPages[message.user].page });
        let count = 0;
        let success = false;
        do {
          try {
            const notifications = await notificationPage.getAllAlertNotificationsTexts();
            await assert(
              notifications,
              'toContain',
              message.text,
              `Expected notification to have text ${message.text} but got ${notifications}`
            );
            success = true;
          } catch (_error) {
            console.log(`could not find notification '${message.text}' on the page of '${message.user}', will retry`);

            // moderator still does something or some action is not finished there?
            await waitForDomStopChanging(meeting.meeting.meetingRoomPage.page, 50, 1000);
          }

          count++;
        } while (count <= 10 && !success);

        if (!success) {
          throw new Error(`could not find notification '${message.text}' on the page of '${message.user}'`);
        }
      } else {
        throw new Error(`${message.user} did not join the meeting`);
      }
    }
  }
);

Then(
  'in the meeting of {string} these participants should have the following audio status:',
  async function (this: CustomWorld, moderator: string, statusesTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    const expectedHeaders = ['participant', 'status'];
    validateDataTableHeaders(statusesTable, expectedHeaders);
    const statuses = statusesTable.hashes();
    for (const status of statuses) {
      if (meeting.participantMeetingRoomPages && meeting.participantMeetingRoomPages[status.participant]) {
        await meeting.participantMeetingRoomPages[status.participant].page.bringToFront();
        const isAudioOn = await meeting.participantMeetingRoomPages[status.participant].isAudioOn();
        if (status.status === 'enabled') {
          await assert(isAudioOn, 'toBeTruthy', undefined, `Expected mics to be enabled but it was disabled`);
        } else if (status.status === 'disabled') {
          await assert(isAudioOn, 'toBeFalsy', undefined, `Expected mics to be disabled but it was enabled`);
        } else {
          throw new Error(`${status.status} is an invalid status, only "enabled" and "disabled" are accepted`);
        }
      } else {
        throw new Error(`${status.participant} did not join the meeting`);
      }
    }
  }
);

When(
  '{string} unmutes himself in the meeting of {string}',
  async function (this: CustomWorld, participant: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    if (meeting.participantMeetingRoomPages && meeting.participantMeetingRoomPages[participant]) {
      await meeting.participantMeetingRoomPages[participant].page.bringToFront();
      await meeting.participantMeetingRoomPages[participant].turnAudioOn();
    } else {
      throw new Error(`${participant} did not join the meeting`);
    }
  }
);
