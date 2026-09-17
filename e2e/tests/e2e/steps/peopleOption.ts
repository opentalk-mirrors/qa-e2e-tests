// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { isTimeAscending, isTimeDescending } from '../../helper/checkTimeOrderHelper';
import { PeopleOptionPage } from '../../pages/MeetingRoom/PeopleOptionPage';
import { CustomWorld } from '../cucumberWorld';

let peopleOptionPage: PeopleOptionPage;

Then(
  'for {string} these participants should be labeled as guests on the People-Option-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    const guestsName = dataTable.raw().map(([guest]) => guest);
    for (const guest of guestsName) {
      await assert(
        await peopleOptionPage.isGuest(guest),
        'toBeTruthy',
        `Expected participant "${guest}" to be labeled as a guest on the People-Option page, but the guest label was not found`
      );
    }
  }
);

Then(
  'for {string} the participants joined time should have the format "Joined HH:MM" on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      peopleOptionPage.participantsList,
      'toBeVisible',
      'Expected the participants list to be visible before checking participant join times on the People-Option page'
    );

    for (let i = 0; i < (await peopleOptionPage.getTotalParticipantsNumber()); i++) {
      await assert(
        await peopleOptionPage.getParticipantDetails(i),
        'toMatch',
        /Joined ([01]\d|2[0-3]):[0-5]\d/,
        `Expected participant at index ${i} to have a join time in the "Joined HH:MM" format on the People-Option page`
      );
    }
  }
);

Then(
  'for {string} the audio status for each participant should be displayed on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      peopleOptionPage.participantsList,
      'toBeVisible',
      'Expected the participants list to be visible before checking participant audio statuses on the People-Option page'
    );

    for (let i = 0; i < (await peopleOptionPage.getTotalParticipantsNumber()); i++) {
      await assert(
        peopleOptionPage.microphonesStatus.nth(i),
        'toBeVisible',
        `Expected the audio status for participant at index ${i} to be displayed on the People-Option page`
      );
    }
  }
);

When(
  '{string} selects the search participant textbox on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.selectSearchParticipant();
  }
);

Then(
  'for {string} the search participant textbox with the placeholder text {string} should be displayed on the People-Option-Page',
  async function (this: CustomWorld, user: string, placeholder: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      await peopleOptionPage.getSearchParticipantPlaceholder(),
      'toBe',
      placeholder,
      `Expected the search participant textbox to have placeholder "${placeholder}" on the People-Option page`
    );
  }
);

When(
  /"([^"]*)" types the text "([^"]*)" into the search participant textbox on the People-Option-Page/,
  async function (this: CustomWorld, user: string, searchText: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.typeInSearchParticipantTextbox(searchText);
  }
);

When(
  '{string} clears the typed text in the search participant textbox on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.clearTextInSearchParticipantTextbox();
  }
);

Then(
  'the search participant textbox on the People-Option-Page should contain no text for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      await peopleOptionPage.getSearchParticipantTextboxValue(),
      'toBe',
      '',
      `Expected the search participant textbox to be empty on the People-Option page`
    );
  }
);

Then(
  'for {string} searched results should be empty on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      await peopleOptionPage.getTotalParticipantsNumber(),
      'toBe',
      0,
      `Expected no participants to match the search on the People-Option page`
    );
  }
);

When(
  '{string} shows the possible order selections on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.showPossibleOrderSelections();
  }
);

Then(
  /(?:these|this) menu item(?:s) should be displayed on the People-Option-Page for "([^"]*)":/,
  async function (this: CustomWorld, user: string, expectedElements: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    let existingElements: string[] = [];
    existingElements = await peopleOptionPage.getAllMenuItemsInnerText();
    for (const expectedElement of expectedElements.raw().flat()) {
      let elementFound = false;
      for (const existingElement of existingElements) {
        if (expectedElement === existingElement) {
          elementFound = true;
          break;
        }
      }
      await assert(
        elementFound,
        'toBeTruthy',
        `Expected the menu item "${expectedElement}" to be displayed on the People-Option page, but it was not found`
      );
    }
  }
);

When(
  '{string} orders the participants by {string} on the People-Option-Page',
  async function (this: CustomWorld, user: string, sortOption: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.sortParticipants(sortOption);
  }
);

Then(
  'for {string} the participants list should be displayed in {string} order on the People-Option-Page',
  async function (this: CustomWorld, user: string, sortOption: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    switch (sortOption) {
      case 'Ascending': {
        const participantsNames: string[] = await peopleOptionPage.getAllParticipantsNames();
        const expectedOrder = [...participantsNames].sort((a, b) => a.localeCompare(b));
        await assert(
          participantsNames,
          'toEqual',
          expectedOrder,
          `Expected participants to be sorted alphabetically in ascending order on the People-Option page`
        );

        break;
      }

      case 'Descending': {
        const participantsNames: string[] = await peopleOptionPage.getAllParticipantsNames();
        const expectedOrder = [...participantsNames].sort((a, b) => b.localeCompare(a));
        await assert(
          participantsNames,
          'toEqual',
          expectedOrder,
          `Expected participants to be sorted alphabetically in descending order on the People-Option page`
        );

        break;
      }

      case 'First Join Time': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Joined');
        await assert(
          isTimeAscending(times.slice(1)),
          'toBeTruthy',
          `Expected participants to be sorted by earliest join time first on the People-Option page`
        );

        break;
      }

      case 'Last Join Time': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Joined');
        await assert(
          isTimeDescending(times.slice(1)),
          'toBeTruthy',
          `Expected participants to be sorted by latest join time first on the People-Option page`
        );

        break;
      }

      case 'Last Active': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Last Active');
        await assert(
          isTimeDescending(times.slice(1)),
          'toBeTruthy',
          `Expected participants to be sorted by most recent activity first on the People-Option page`
        );

        break;
      }

      case 'Raised Hand First': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Hand raised');
        await assert(
          isTimeAscending(times.slice(1)),
          'toBeTruthy',
          `Expected participants with raised hands to be sorted by the earliest hand raise time on the People-Option page`
        );

        break;
      }

      default:
        throw new Error(`Invalid order ${sortOption}`);
    }
  }
);

Then(
  'for {string} order selection dropdown should not be displayed on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      peopleOptionPage.sortByDropdown,
      'not toBeVisible',
      `Expected the order selection dropdown to be hidden on the People-Option page`
    );
  }
);

Then(
  /for "([^"]*)" these participants should be listed on the People-Option-Page:/,
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    const participantsName: string[] = await peopleOptionPage.getAllParticipantsNames();
    const participants = dataTable.raw().map(([participant]) => participant);
    await assert(
      participantsName.length,
      'toBe',
      participants.length,
      `Expected ${participants.length} participant(s) to be displayed on the People-Option page, but found ${participantsName.length}`
    );

    for (let i = 0; i < participants.length; i++) {
      await assert(
        participantsName[i],
        'toContain',
        participants[i],
        `Expected participant at position ${i + 1} to be "${participants[i]}" on the People-Option page`
      );
    }
  }
);

When(
  /"([^"]*)" sends a "([^"]*)" message "([^"]*)" to "([^"]*)" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, messageType: 'direct' | 'private', message: string, to: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    if (messageType === 'direct') {
      const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
      await peopleOptionPage.hoverParticipantsList(to);
      await peopleOptionPage.selectParticipantMenu(to);
      await peopleOptionPage.navigateToDirectMessage();
    } else if (messageType === 'private') {
      const messagesPage = await meeting.meetingRoomPage.openMessages();
      await messagesPage.openMessagesMenu();
      await messagesPage.openPrivateMessage(to);
    } else {
      throw new Error(`Invalid message type: ${messageType}. Message type should be either direct or private`);
    }
    await meeting.meetingRoomPage.typeMessage(message);
    await meeting.meetingRoomPage.submitChat();
  }
);

When(
  '{string} removes {string} from the meeting room',
  async function (this: CustomWorld, moderator: string, userToRemove: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.selectParticipantMenu(userToRemove);
    await peopleOptionPage.removeParticipant();
  }
);

When(
  '{string} moves {string} to the waiting room from the meeting room',
  async function (this: CustomWorld, moderator: string, userToMove: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.selectParticipantMenu(userToMove);
    await peopleOptionPage.moveParticipant();
  }
);

When(
  /"([^"]*)" (?:renames|tries to rename) "([^"]*)" to "([^"]*)" in the meeting room$/,
  async function (this: CustomWorld, moderator: string, userToRename: string, newName: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.selectParticipantMenu(userToRename);
    await peopleOptionPage.renameParticipant(newName);
  }
);

Then(
  'for {string} the rename error {string} should be displayed on the People-Option-Page',
  async function (this: CustomWorld, user: string, errorMessage: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    const renameErrorText = await peopleOptionPage.getRenameErrorText();
    await assert(
      renameErrorText,
      'toBe',
      errorMessage,
      `Expected the rename error message to be "${errorMessage}" on the People-Option page, but found "${renameErrorText}"`
    );
  }
);

Then(
  'for {string} {string} should be displayed in the participants list on the People-Option-Page',
  async function (this: CustomWorld, user: string, name: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await assert(
      peopleOptionPage.getParticipantByName(name),
      'toBeVisible',
      `Expected participant "${name}" to be visible in the participants list on the People-Option page`
    );
  }
);

When(
  /"([^"]*)" revokes presenter role from "([^"]*)" in the meeting room$/,
  async function (this: CustomWorld, moderator: string, userToRevoke: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.selectParticipantMenu(userToRevoke);
    await peopleOptionPage.revokePresenterRole();
  }
);

When(
  /"([^"]*)" grants presenter role to "([^"]*)" in the meeting room$/,
  async function (this: CustomWorld, moderator: string, userToGrant: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    const peopleOptionPage = await meeting.meetingRoomPage.selectPeopleOption();
    await peopleOptionPage.selectParticipantMenu(userToGrant);
    await peopleOptionPage.grantPresenterRole();
  }
);
