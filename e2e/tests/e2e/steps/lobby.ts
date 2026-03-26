// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';
import { CustomWorld } from '../cucumberWorld';

When(
  '{string} tries to rejoin the meeting room of {string}',
  async function (this: CustomWorld, user: string, moderator: string) {
    const page = this.getStartedMeeting(moderator).participantMeetingRoomPages[user].page;
    const lobbyRoomPage = new LobbyRoomPage({ page });
    await lobbyRoomPage.enterMeetingRoom(user);
  }
);

Then(
  '{string} should be in the waiting room of the meeting named {string} created by {string}',
  async function (this: CustomWorld, user: string, meetingName: string, moderator: string) {
    const page = this.getStartedMeeting(moderator).participantMeetingRoomPages[user].page;
    const lobbyRoomPage = new LobbyRoomPage({ page });
    const meetingTitleLocator = await lobbyRoomPage.getMeetingInvitationTitleLocator(meetingName);
    await assert(meetingTitleLocator, 'toBeVisible', undefined, 'Meeting title locator is not visible');
    await assert(lobbyRoomPage.waitingRoomText, 'toBeVisible', undefined, 'Waiting room text is not visible');
    await assert(
      lobbyRoomPage.joinMeetingAutomaticallyLabel,
      'toBeVisible',
      undefined,
      'Join meeting automatically label is not visible'
    );
    await assert(
      lobbyRoomPage.joinMeetingAutomaticallyCheckbox,
      'toBeChecked',
      undefined,
      'Join meeting automatically checkbox should be checked'
    );
  }
);
