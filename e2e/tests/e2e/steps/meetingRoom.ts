// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { BurgerMenuPage } from '../../pages/MeetingRoom/BurgerMenuPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { CustomWorld } from '../cucumberWorld';

let meetingRoomPage: MeetingRoomPage;
let burgerMenuPage: BurgerMenuPage;

When('{string} opens the "Report a bug" form', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  meetingRoomPage = meeting.meetingRoomPage;
  burgerMenuPage = await meetingRoomPage.openBurgerMenu();
  await burgerMenuPage.openReportABug();
});

Then(
  'for {string} the home view of the moderator sidebar should be open on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.page.bringToFront();
    await assert(
      await meetingRoomPage.isOptionSelected(meetingRoomPage.moderationTools.homeButton),
      'toBeTruthy',
      `Expected the Home view to be selected in the moderator sidebar`
    );
  }
);

Then(
  'for {string} these tabs should be displayed in the sidebar on the Meeting-Room-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });

    const tabs = dataTable.raw().map(([value]) => value);
    for (const tab of tabs) {
      switch (tab) {
        case 'Chat':
          await assert(meetingRoomPage.chatButton, 'toBeVisible', `Expected the Chat tab to be visible`);
          break;
        case 'Messages':
          await assert(meetingRoomPage.messagesButton, 'toBeVisible', `Expected the Messages tab to be visible`);
          break;
        default: {
          if (tab.startsWith('People')) {
            const expectedParticipantsNum = Number(tab.split('(')[1]?.replace(')', ''));
            const actualParticipantsNum = Number(
              (await meetingRoomPage.getParticipantsTabText()).split('(')[1]?.replace(')', '')
            );
            await assert(
              meetingRoomPage.participantsButton,
              'toBeVisible',
              `Expected the Participants tab to be visible`
            );
            await assert(
              expectedParticipantsNum,
              'toBe',
              actualParticipantsNum,
              `Expected the Participants tab to show ${expectedParticipantsNum} participants`
            );
            break;
          }
          throw new Error(`Invalid tab: ${tab}`);
        }
      }
    }
  }
);

Then(
  'for {string} the chat tab should be selected in the sidebar on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.chatButton, 'toBeVisible', `Expected the Chat tab to be visible`);
    await assert(
      await meetingRoomPage.isOptionSelected(meetingRoomPage.chatButton),
      'toBeTruthy',
      `Expected the Chat tab to be selected`
    );
  }
);

Then(
  'for {string} the chat option should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.chatOption, 'toBeVisible', `Expected the Chat option to be visible`);
  }
);

Then(
  'for {string} a search field should be displayed in the chat area on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.searchInChatButton, 'toBeVisible', `Expected the chat search field to be visible`);
  }
);

Then(
  /^for "([^"]*)" the chat textfield should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.page.bringToFront();
    await assert(meetingRoomPage.chatTextArea, 'toBeVisible', `Expected the chat input text field to be visible`);
  }
);

Then(
  'for {string} there should be a description in the chat area of the meeting room of {string} saying:',
  async function (this: CustomWorld, guest: string, moderator: string, description: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    await startedMeeting.participantMeetingRoomPages[guest].page.bringToFront();
    await assert(
      startedMeeting.participantMeetingRoomPages[guest].chatHistoryDescription,
      'toHaveText',
      description,
      `Expected chat history description for guest "${guest}" to be "${description}".`
    );
  }
);

Then(
  'for {string} the emoji selection button should be displayed in the chat area of the sidebar on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.emojiPicker, 'toBeVisible', `Expected the emoji picker button to be visible`);
  }
);

Then(
  /^for "([^"]*)" the textbox named "([^"]*)" should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, name: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.chatTextArea, 'toHaveText', name, `Expected the chat textbox to be named "${name}"`);
  }
);

Then(
  'for {string} the chat submit button should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.chatSubmitButton, 'toBeVisible', `Expected the chat submit button to be visible`);
  }
);

When(
  '{string} opens the emoji picker dialog on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.openEmojiPickerDialog();
  }
);

When(
  /^"([^"]*)" selects the "([^"]*)" emoji on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, emoji: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.selectEmoji(emoji);
  }
);

Then(
  /^for "([^"]*)" the message "([^"]*)" should be displayed in the input textbox on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getChatTextFieldInputValue(),
      'toBe',
      message,
      `Expected the chat input to contain "${message}"`
    );
  }
);

When(
  '{string} presses the escape button twice on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.pressEscape();
    await meetingRoomPage.pressEscape();
  }
);

Then(
  /^for "([^"]*)" the emoji picker dialog (should|should not) be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, actionType: 'should' | 'should not') {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });

    if (actionType === 'should') {
      await assert(meetingRoomPage.emojiPickerDialog, 'toBeVisible', `Expected the emoji picker dialog to be visible`);
    } else {
      await assert(
        meetingRoomPage.emojiPickerDialog,
        'not toBeVisible',
        `Expected the emoji picker dialog not to be visible`
      );
    }
  }
);

When(
  '{string} sends the current chat message on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.submitChat();
  }
);

Then(
  'for {string} there should be these participants listed in the chat as having joined the room on the Meeting-Room-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.selectChatTab();
    const joinedDetails = await meetingRoomPage.getParticipantsDetails();
    const participants = dataTable.raw().map(([participant]) => participant);
    for (const [index, participant] of participants.entries()) {
      await assert(
        joinedDetails[index].trim(),
        'toMatch',
        new RegExp(`^${participant}joined the meeting at \\d{2}:\\d{2}$`),
        `Expected "${participant}" to have a "joined the call at HH:MM" entry`
      );
    }
  }
);

Then(
  /^for "([^"]*)" no participants details about who joined the call should be displayed in the chat of the meeting room of "([^"]*)"/,
  async function (this: CustomWorld, guest: string, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    const joinedDetails = await startedMeeting.participantMeetingRoomPages[guest].getParticipantsDetails();
    await assert(joinedDetails, 'toEqual', [], `Expected no participant join details to be displayed`);
  }
);

Then(
  /^for "([^"]*)" the last message in the chat should be: "([^"]*)" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getLastChatText(),
      'toContain',
      user,
      `Expected the last chat message to contain sender "${user}"`
    );
    await assert(
      await meetingRoomPage.getLastChatText(),
      'toContain',
      message,
      `Expected the last chat message to contain "${message}"`
    );
  }
);

Then(
  /^for "([^"]*)" the sent time of the last message in the chat should have the format "HH:MM" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getLastChatText(),
      'toMatch',
      /([01]?[0-9]|2[0-3]):[0-5][0-9]/,
      `Expected the last chat message to contain a timestamp in HH:MM format`
    );
  }
);

Then(
  /^for "([^"]*)" the last message in the chat in the meeting room of "([^"]*)" should be: "([^"]*)"/,
  async function (this: CustomWorld, guest: string, moderator: string, message: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    await startedMeeting.participantMeetingRoomPages[guest].page.bringToFront();
    const chatListText = await startedMeeting.participantMeetingRoomPages[guest].filterChatText(message);
    await assert(chatListText, 'toContain', message, `Expected the chat to contain the message "${message}"`);
  }
);

When(
  '{string} selects the chat input textbox on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.selectChatTextbox();
  }
);

Then(
  /^for "([^"]*)" the chat label with placeholder text "([^"]*)" should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, placeholder: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getChatTextboxPlaceholder(),
      'toBe',
      placeholder,
      `Expected the chat textbox placeholder to be "${placeholder}"`
    );
  }
);

When(
  /^"([^"]*)" types message "([^"]*)" in the chat input textbox on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.typeMessage(message);
  }
);

Then(
  /^for "([^"]*)" the error message "([^"]*)" (should|should not) be displayed below the chat input textbox on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, errorMessage: string, actionType: 'should' | 'should not') {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    if (actionType === 'should') {
      await assert(
        await meetingRoomPage.getEmptyMessageErrorText(),
        'toBe',
        errorMessage,
        `Expected the empty message error to be "${errorMessage}"`
      );
    } else {
      await assert(
        meetingRoomPage.emptyMessageError,
        'not toBeVisible',
        `Expected the empty message error not to be visible`
      );
    }
  }
);

Given(
  '{string} has sent the following messages in the chat on the Meeting-Room-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.page.bringToFront();
    const messagesList = dataTable.raw().map(([message]) => message);
    for (const message of messagesList) {
      await meetingRoomPage.selectChatTextbox();
      await meetingRoomPage.typeMessage(message);
      await meetingRoomPage.submitChat();
    }
  }
);

When(
  '{string} selects the search in the chat textbox on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.selectSearchInChatTextbox();
  }
);

Then(
  /^for "([^"]*)" the search in the chat label with placeholder "([^"]*)" should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, placeholder: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getSearchInChatTextboxPlaceholder(),
      'toBe',
      placeholder,
      `Expected the search textbox placeholder to be "${placeholder}"`
    );
  }
);

When(
  /^"([^"]*)" (?:types|searches for) "([^"]*)" in the (?:search in the chat textbox|chat) on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, text: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.typeTextInSearchInChatTextbox(text);
  }
);

Then(
  /^for "([^"]*)" all the messages that closely match "([^"]*)" should be displayed in the chat (?:overview |)on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    const chatListTexts = await meetingRoomPage.getAllChatListTexts();
    for (const chatListText of chatListTexts) {
      const subTexts = chatListText.split('\n').filter((subText) => subText.trim() !== '');
      await assert(
        subTexts[2].toLowerCase().includes(message),
        'toBeTruthy',
        `Expected every displayed message to contain "${message}"`
      );
    }
  }
);

Then(
  /^for "([^"]*)" the participant name "([^"]*)" should be displayed for each message on the Meeting-Room-Page$/,
  async function (this: CustomWorld, user: string, participantName: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    const chatListTexts = await meetingRoomPage.getAllChatListTexts();
    for (const chatListText of chatListTexts) {
      const subTexts = chatListText.split('\n').filter((subText) => subText.trim() !== '');
      await assert(
        subTexts[0],
        'toContain',
        participantName,
        `Expected every displayed message to show participant "${participantName}"`
      );
    }
  }
);

Then(
  /^for "([^"]*)" the message sent time for all messages in the chat on the Meeting-Room-Page should be "HH:MM"$/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    const chatListTexts = await meetingRoomPage.getAllChatListTexts();
    for (const chatListText of chatListTexts) {
      const subTexts = chatListText.split('\n').filter((subText) => subText.trim() !== '');
      await assert(
        subTexts[1],
        'toMatch',
        /([01]?[0-9]|2[0-3]):[0-5][0-9]/,
        `Expected every displayed message to have a timestamp in HH:MM format`
      );
    }
  }
);

When(
  /"([^"]*)" (?:closes|clears) the search in the chat (?:textbox |)on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.closeSearchInChatTextbox();
  }
);

Then(
  /^for "([^"]*)" the text "([^"]*)" should be displayed in the chat (?:overview |)on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, text: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      meetingRoomPage.noMessageMatchText,
      'toHaveText',
      text,
      `Expected the "no matching messages" text to be "${text}"`
    );
  }
);

Then(
  'for {string} the reset button should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(meetingRoomPage.resetButton, 'toBeVisible', `Expected the Reset button to be visible`);
  }
);

When(
  /"([^"]*)" resets the (?:searched text|search) in the chat (?:overview |)on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.resetMatchedSearchedText();
  }
);

Then(
  /^for "([^"]*)" search results should be cleared on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getSearchInChatTextboxValue(),
      'toBe',
      '',
      `Expected the chat search textbox to be empty`
    );
  }
);

Then(
  /^for "([^"]*)" the chat overview should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.scrollChatListItems();
    await assert(
      meetingRoomPage.joinedText.first(),
      'toBeVisible',
      `Expected the chat overview to display join events`
    );
    await assert(
      await meetingRoomPage.getAllChatListTexts(),
      'not toEqual',
      [],
      `Expected the chat overview to contain messages`
    );
    await assert(meetingRoomPage.resetButton, 'not toBeVisible', `Expected the Reset button not to be visible`);
  }
);

Then(
  /the chat messages count for "([^"]*)" should be (\d+) on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, count: number) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await assert(
      await meetingRoomPage.getAllChatListCount(),
      'toBe',
      count,
      `Expected the chat overview to contain ${count} messages`
    );
  }
);

When(
  /^"([^"]*)" leaves the meeting room of "([^"]*)"/,
  async function (this: CustomWorld, guest: string, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    await startedMeeting.participantMeetingRoomPages[guest].page.bringToFront();
    await startedMeeting.participantMeetingRoomPages[guest].leaveMeeting();
    this.removeParticipantMeetingRoom(moderator, guest);
  }
);

When(
  'these participants raise their hands in the Meeting room of {string} with delay of {int} milliseconds:',
  async function (this: CustomWorld, moderator: string, delay: number, dataTable: DataTable) {
    const participants = dataTable.raw().map(([guest]) => guest);
    const startedMeeting = this.getStartedMeeting(moderator);
    for (let i = 0; i < participants.length; i++) {
      await startedMeeting.participantMeetingRoomPages[participants[i]].page.bringToFront();
      await startedMeeting.participantMeetingRoomPages[participants[i]].page.waitForTimeout(delay);
      await startedMeeting.participantMeetingRoomPages[participants[i]].raiseYourHand();
    }
  }
);

When(
  'these participants lower their hands in the Meeting room of {string}:',
  async function (this: CustomWorld, moderator: string, dataTable: DataTable) {
    const participants = dataTable.raw().map(([guest]) => guest);
    const startedMeeting = this.getStartedMeeting(moderator);
    for (let i = 0; i < participants.length; i++) {
      await startedMeeting.participantMeetingRoomPages[participants[i]].page.bringToFront();
      await startedMeeting.participantMeetingRoomPages[participants[i]].lowerYourHand();
    }
  }
);

When('{string} views the participants on the Meeting-Room-Page', async function (this: CustomWorld, moderator: string) {
  const meeting = this.getStartedMeeting(moderator).meeting;
  await meeting.meetingRoomPage.selectParticipantsOption();
});

Then(
  '{string} should be notified with the following text in the meeting room of {string}:',
  async function (this: CustomWorld, receiver: string, moderator: string, notification: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[receiver].page.bringToFront();
    const notificationPage = new NotificationPage({ page: meeting.participantMeetingRoomPages[receiver].page });
    const notificationTexts = await notificationPage.getAllAlertNotificationsTexts();
    await assert(
      notificationTexts,
      'toContain',
      notification,
      `Expected "${notificationTexts}" to contain "${notification}"`
    );
  }
);

Then(
  '{string} should receive a notification containing the following text in the meeting room of {string}:',
  async function (this: CustomWorld, receiver: string, moderator: string, notification: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[receiver].page.bringToFront();
    const notificationPage = new NotificationPage({ page: meeting.participantMeetingRoomPages[receiver].page });
    const notificationTexts = await notificationPage.getAllAlertNotificationsTexts();

    const matchingNotification = notificationTexts.find((notificationText) => notificationText.includes(notification));
    await assert(
      matchingNotification,
      'toContain',
      notification,
      `Expected the notification to contain "${notification}", but received "${matchingNotification}"`
    );
    await notificationPage.closeNotificationAlert(notification);
  }
);

Then(
  'for {string} the unread message indicator should be displayed in the meeting room of {string}',
  async function (this: CustomWorld, user: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    await assert(
      await meeting.participantMeetingRoomPages[user].isMessageUnread(),
      'toBeTruthy',
      `Expected the unread message indicator to be visible`
    );
  }
);

When(
  '{string} tries to send an empty message on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.submitChat();
  }
);

Then(
  'for {string} the error {string} should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string, errorMessage: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await assert(
      await meeting.meetingRoomPage.getEmptyMessageErrorText(),
      'toBe',
      errorMessage,
      `Expected the empty message error to be "${errorMessage}"`
    );
  }
);

When(
  '{string} sends a message {string} on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string, message: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.typeMessage(message);
    await meeting.meetingRoomPage.submitChat();
  }
);

Then(
  /for "([^"]*)" the waiting room indicator should show (\d+) (?:participant|participants) on the Meeting-Room-Page/,
  async function (this: CustomWorld, moderator: string, count: number) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const totalNumOfWaitingParticipants = await meeting.meetingRoomPage.getTotalWaitingParticipants();
    await assert(
      totalNumOfWaitingParticipants,
      'toBe',
      count,
      `Expected ${totalNumOfWaitingParticipants} to be ${count}`
    );
  }
);

When(
  '{string} accepts the participation of {string} into the meeting room',
  async function (this: CustomWorld, moderator: string, userToAccept: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.acceptParticipant(userToAccept);
  }
);

Then(
  '{string} should be on the Meeting-Room-Page of the meeting named {string} created by {string}',
  async function (this: CustomWorld, user: string, meetingTitle: string, moderator: string) {
    const page = this.getStartedMeeting(moderator).participantMeetingRoomPages[user].page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    const meetingRoomName = await meetingRoomPage.getMeetingRoomName();
    await assert(meetingRoomName, 'toContain', meetingTitle, `Expected ${meetingRoomName} to contain ${meetingTitle}`);
  }
);

Then(
  'for {string} {string} should be displayed on the tile view on the Meeting-Room-Page',
  async function (this: CustomWorld, moderator: string, name: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await assert(
      meeting.meetingRoomPage.getParticipantTileLocatorByName(name),
      'toBeVisible',
      `${name} participant tile is not visible`
    );
  }
);

Then(
  /"([^"]*)" (should|should not) be allowed to share screen in the meeting room of "([^"]*)"/,
  async function (this: CustomWorld, user: string, action: 'should' | 'should not', moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    const isAllowed = await meeting.participantMeetingRoomPages[user].isScreenShareAllowed();
    const shouldBeAllowed = action === 'should';
    await assert(
      isAllowed,
      'toBe',
      shouldBeAllowed,
      `for ${user} screen share should ${shouldBeAllowed ? 'be' : 'not be'} allowed`
    );
  }
);
