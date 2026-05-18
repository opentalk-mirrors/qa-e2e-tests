// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import assert from 'node:assert';

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
      expect(await peopleOptionPage.isGuest(guest)).toBeTruthy();
    }
  }
);

Then(
  'for {string} the participants joined time should have the format "Joined HH:MM" on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await expect(peopleOptionPage.participantsList).toBeVisible();
    for (let i = 0; i < (await peopleOptionPage.getTotalParticipantsNumber()); i++) {
      expect(await peopleOptionPage.getParticipantDetails(i)).toMatch(/Joined ([01]\d|2[0-3]):[0-5]\d/);
    }
  }
);

Then(
  'for {string} the audio status for each participant should be displayed on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await expect(peopleOptionPage.participantsList).toBeVisible();
    for (let i = 0; i < (await peopleOptionPage.getTotalParticipantsNumber()); i++) {
      await expect(peopleOptionPage.microphonesStatus.nth(i)).toBeVisible();
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
    expect(await peopleOptionPage.getSearchParticipantPlaceholder()).toBe(placeholder);
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
    expect(await peopleOptionPage.getSearchParticipantTextboxValue()).toBe('');
  }
);

Then(
  'for {string} searched results should be empty on the People-Option-Page',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    expect(await peopleOptionPage.getTotalParticipantsNumber()).toBe(0);
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
      assert(elementFound, `could not find the element '${expectedElement}'`);
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
        expect(participantsNames).toEqual(expectedOrder);
        break;
      }

      case 'Descending': {
        const participantsNames: string[] = await peopleOptionPage.getAllParticipantsNames();
        const expectedOrder = [...participantsNames].sort((a, b) => b.localeCompare(a));
        expect(participantsNames).toEqual(expectedOrder);
        break;
      }

      case 'First Join Time': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Joined');
        expect(isTimeAscending(times.slice(1))).toBeTruthy();
        break;
      }

      case 'Last Join Time': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Joined');
        expect(isTimeDescending(times.slice(1))).toBeTruthy();
        break;
      }

      case 'Last Active': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Last Active');
        expect(isTimeDescending(times.slice(1))).toBeTruthy();

        break;
      }

      case 'Raised Hand First': {
        const times = await peopleOptionPage.getAllParticipantsTimes('Hand raised');
        expect(isTimeAscending(times.slice(1))).toBeTruthy();
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
    await expect(peopleOptionPage.sortByDropdown).not.toBeVisible();
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
    expect(participantsName.length).toBe(participants.length);
    for (let i = 0; i < participants.length; i++) {
      expect(participantsName[i]).toContain(participants[i]);
    }
  }
);

When(
  /"([^"]*)" sends a direct message "([^"]*)" to "([^"]*)" on the Meeting-Room-Page/,
  async function (this: CustomWorld, user: string, message: string, to: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectPeopleOption();
    peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.hoverParticipantsList(to);
    await peopleOptionPage.selectParticipantMenu(to);
    await peopleOptionPage.navigateToDirectMessage();
    await meeting.meetingRoomPage.typeMessage(message);
    await meeting.meetingRoomPage.submitChat();
  }
);

When(
  '{string} removes {string} from the meeting room',
  async function (this: CustomWorld, moderator: string, userToRemove: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectPeopleOption();
    const peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.selectParticipantMenu(userToRemove);
    await peopleOptionPage.removeParticipant();
  }
);

When(
  '{string} moves {string} to the waiting room from the meeting room',
  async function (this: CustomWorld, moderator: string, userToMove: string) {
    const meeting = this.getStartedMeeting(moderator).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectPeopleOption();
    const peopleOptionPage = new PeopleOptionPage({ page: meeting.meetingRoomPage.page });
    await peopleOptionPage.selectParticipantMenu(userToMove);
    await peopleOptionPage.moveParticipant();
  }
);
