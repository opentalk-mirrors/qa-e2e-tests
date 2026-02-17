// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

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
    expect(await meetingRoomPage.isOptionSelected(meetingRoomPage.moderationTools.homeButton)).toBeTruthy();
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
          await expect(meetingRoomPage.chatButton).toBeVisible();
          break;
        case 'Messages':
          await expect(meetingRoomPage.messagesButton).toBeVisible();
          break;
        default: {
          if (tab.startsWith('People')) {
            const expectedParticipantsNum = Number(tab.split('(')[1]?.replace(')', ''));
            const actualParticipantsNum = Number(
              (await meetingRoomPage.getPeopleTabText()).split('(')[1]?.replace(')', '')
            );
            await expect(meetingRoomPage.peopleButton).toBeVisible();
            expect(expectedParticipantsNum).toBe(actualParticipantsNum);
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
    await expect(meetingRoomPage.chatButton).toBeVisible();
    expect(await meetingRoomPage.isOptionSelected(meetingRoomPage.chatButton)).toBeTruthy();
  }
);

Then(
  'for {string} the chat option should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.chatOption).toBeVisible();
  }
);

Then(
  'for {string} a search field should be displayed in the chat area on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.searchInChatButton).toBeVisible();
  }
);

Then(
  /^for "([^"]*)" the chat textfield should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.chatTextArea).toBeVisible();
  }
);

Then(
  'for {string} there should be a description in the chat area of the meeting room of {string} saying:',
  async function (this: CustomWorld, guest: string, moderator: string, description: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    await startedMeeting.participantMeetingRoomPages[guest].page.bringToFront();
    await expect(startedMeeting.participantMeetingRoomPages[guest].chatHistoryDescription).toHaveText(description);
  }
);

Then(
  'for {string} the emoji selection button should be displayed in the chat area of the sidebar on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.emojiPicker).toBeVisible();
  }
);

Then(
  /^for "([^"]*)" the textbox named "([^"]*)" should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, name: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.chatTextArea).toHaveText(name);
  }
);

Then(
  'for {string} the chat submit button should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.chatSubmitButton).toBeVisible();
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
    expect(await meetingRoomPage.getChatTextFieldInputValue()).toBe(message);
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
      await expect(meetingRoomPage.emojiPickerDialog).toBeVisible();
    } else {
      await expect(meetingRoomPage.emojiPickerDialog).not.toBeVisible();
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
    const joinedDetails = await meetingRoomPage.getParticipantsDetails();
    const participants = dataTable.raw().map(([participant]) => participant);
    participants.forEach((participant, index) => {
      expect(joinedDetails[index].trim()).toMatch(new RegExp(`^${participant}joined the call at \\d{2}:\\d{2}$`));
    });
  }
);

Then(
  /^for "([^"]*)" no participants details about who joined the call should be displayed in the chat of the meeting room of "([^"]*)"/,
  async function (this: CustomWorld, guest: string, moderator: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    const joinedDetails = await startedMeeting.participantMeetingRoomPages[guest].getParticipantsDetails();
    expect(joinedDetails).toEqual([]);
  }
);

Then(
  /^for "([^"]*)" the last message in the chat should be: "([^"]*)" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    expect(await meetingRoomPage.getLastChatText()).toContain(user);
    expect(await meetingRoomPage.getLastChatText()).toContain(message);
  }
);

Then(
  /^for "([^"]*)" the sent time of the last message in the chat should have the format "HH:MM" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    expect(await meetingRoomPage.getLastChatText()).toMatch(/([01]?[0-9]|2[0-3]):[0-5][0-9]/);
  }
);

Then(
  /^for "([^"]*)" the last message in the chat in the meeting room of "([^"]*)" should be: "([^"]*)"/,
  async function (this: CustomWorld, guest: string, moderator: string, message: string) {
    const startedMeeting = this.getStartedMeeting(moderator);
    await startedMeeting.participantMeetingRoomPages[guest].page.bringToFront();
    const chatListText = await startedMeeting.participantMeetingRoomPages[guest].filterChatText(message);
    expect(chatListText).toContain(message);
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
    expect(await meetingRoomPage.getChatTextboxPlaceholder()).toBe(placeholder);
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
      expect(await meetingRoomPage.getEmptyMessageErrorText()).toBe(errorMessage);
    } else {
      await expect(meetingRoomPage.emptyMessageError).not.toBeVisible();
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
    expect(await meetingRoomPage.getSearchInChatTextboxPlaceholder()).toBe(placeholder);
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
      expect(subTexts[2].toLowerCase().includes(message)).toBeTruthy();
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
      expect(subTexts[0]).toContain(participantName);
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
      expect(subTexts[1]).toMatch(/([01]?[0-9]|2[0-3]):[0-5][0-9]/);
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
    await expect(meetingRoomPage.noMessageMatchText).toHaveText(text);
  }
);

Then(
  'for {string} the reset button should be displayed on the Meeting-Room-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await expect(meetingRoomPage.resetButton).toBeVisible();
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
    expect(await meetingRoomPage.getSearchInChatTextboxValue()).toBe('');
  }
);

Then(
  /^for "([^"]*)" the chat overview should be displayed on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    await meetingRoomPage.scrollChatListItems();
    expect(meetingRoomPage.joinedText.first()).toBeVisible();
    expect(await meetingRoomPage.getAllChatListTexts()).not.toEqual([]);
    await expect(meetingRoomPage.resetButton).not.toBeVisible();
  }
);

Then(
  /the chat messages count for "([^"]*)" should be (\d+) on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, count: number) {
    const page = this.getUser(user).page;
    const meetingRoomPage = new MeetingRoomPage({ page: page });
    expect(await meetingRoomPage.getAllChatListCount()).toBe(count);
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
  await meeting.meetingRoomPage.selectPeopleOption();
});

Then(
  '{string} should be notified with {string} in the meeting room of {string}',
  async function (this: CustomWorld, receiver: string, notification: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[receiver].page.bringToFront();
    const notificationPage = new NotificationPage({ page: meeting.participantMeetingRoomPages[receiver].page });
    expect(await notificationPage.getAlertNotificationText()).toBe(notification);
  }
);

Then(
  'for {string} the unread message indicator should be displayed in the meeting room of {string}',
  async function (this: CustomWorld, user: string, moderator: string) {
    const meeting = this.getStartedMeeting(moderator);
    await meeting.participantMeetingRoomPages[user].page.bringToFront();
    expect(await meeting.participantMeetingRoomPages[user].isMessageUnread()).toBeTruthy();
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
    expect(await meeting.meetingRoomPage.getEmptyMessageErrorText()).toBe(errorMessage);
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
