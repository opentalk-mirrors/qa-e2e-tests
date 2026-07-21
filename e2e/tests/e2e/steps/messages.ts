// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { MessagesPage } from '../../pages/MeetingRoom/MessagesPage';
import { CustomWorld } from '../cucumberWorld';

let messagesPage: MessagesPage;

Then(
  'for {string} {string} should be the last message in the chat on the Messages-Page',
  async function (this: CustomWorld, user: string, message: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    messagesPage = new MessagesPage({ page: meeting.meetingRoomPage.page });
    assert(await messagesPage.getParticipantDetails(-1), 'toContain', user, `Expected coffee break icon to be visible`);
    assert(
      await messagesPage.getParticipantDetails(-1),
      'toContain',
      message,
      `Expected coffee break icon to be visible`
    );
    assert(
      await messagesPage.getParticipantDetails(-1),
      'toMatch',
      /([01]?[0-9]|2[0-3]):[0-5][0-9]/,
      `Expected coffee break icon to be visible`
    );
  }
);

Then(
  'for {string} the following messages should be displayed in the chat on the Messages-Page',
  async function (this: CustomWorld, user: string, messages: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    messagesPage = new MessagesPage({ page: meeting.meetingRoomPage.page });
    assert(
      await messagesPage.getParticipantData('message'),
      'toEqual',
      messages.raw().flat(),
      `Expected coffee break icon to be visible`
    );
  }
);

When(
  '{string} navigates to the Messages-Page from the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    messagesPage = new MessagesPage({ page: meeting.meetingRoomPage.page });
    await messagesPage.navigateBackToMessagesInbox();
  }
);

Then(
  'for {string} the message thread with {string} showing the last message {string} should be displayed on the Messages-Page',
  async function (this: CustomWorld, moderator: string, to: string, message: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    messagesPage = new MessagesPage({ page: meeting.meetingRoomPage.page });
    const threads = await messagesPage.getAllThreadsDetails();
    await assert(threads, 'toHaveProperty', to, `Expected coffee break icon to be visible`);
    await assert(threads[to], 'toBe', message, `Expected coffee break icon to be visible`);
  }
);

When(
  '{string} opens the chat with {string} on the Messages-Page',
  async function (this: CustomWorld, moderator: string, chatWith: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    messagesPage = new MessagesPage({ page: meeting.meetingRoomPage.page });
    await messagesPage.openMessagesMenu();
    await messagesPage.openPrivateMessage(chatWith);
  }
);
