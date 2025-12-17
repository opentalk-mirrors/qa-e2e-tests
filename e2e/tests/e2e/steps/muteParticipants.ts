// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { MuteParticipantsPage } from '../../pages/MeetingRoom/ModeratorTools/MuteParticipantsPage';
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
    const muteParticipantsPage = new MuteParticipantsPage(meeting.meetingRoomPage.page);
    await muteParticipantsPage.muteAllParticipants();
  }
);

Then(
  'in the meeting of {string} these alert notifications should be displayed for the respected users:',
  async function (this: CustomWorld, moderator: string, messageTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    const messages = messageTable.hashes();
    for (const message of messages) {
      if (meeting.participantMeetingRoomPages && meeting.participantMeetingRoomPages[message.user]) {
        await meeting.participantMeetingRoomPages[message.user].page.bringToFront();
        const notificationPage = new NotificationPage({ page: meeting.participantMeetingRoomPages[message.user].page });
        let count = 0;
        let success = false;
        do {
          try {
            expect(await notificationPage.getAllAlertNotificationsTexts()).toContain(message.text);
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
  'in the meeting of {string} these users should have the following audio status:',
  async function (this: CustomWorld, moderator: string, statusesTable: DataTable) {
    const meeting = this.getStartedMeeting(moderator);
    const statuses = statusesTable.hashes();
    for (const status of statuses) {
      if (meeting.participantMeetingRoomPages && meeting.participantMeetingRoomPages[status.user]) {
        await meeting.participantMeetingRoomPages[status.user].page.bringToFront();
        if (status.status === 'enabled') {
          expect(await meeting.participantMeetingRoomPages[status.user].isAudioOn()).toBeTruthy();
        } else if (status.status === 'disabled') {
          expect(await meeting.participantMeetingRoomPages[status.user].isAudioOn()).toBeFalsy();
        } else {
          throw new Error(`${status.status} is an invalid status, only "enabled" and "disabled" are accepted`);
        }
      } else {
        throw new Error(`${status.user} did not join the meeting`);
      }
    }
  }
);
