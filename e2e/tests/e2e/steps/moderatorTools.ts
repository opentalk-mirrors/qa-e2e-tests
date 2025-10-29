// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import assert from 'node:assert';

import { ParticipantListWithCheckboxesPage } from '../../pages/MeetingRoom/ModeratorTools/ParticipantListWithCheckboxesPage';
import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { CustomWorld } from '../cucumberWorld';

Then(
  /(?:these|this) "([^"]*)" should be displayed in the open moderator tool for "([^"]*)":/,
  async function (this: CustomWorld, elements: string, user: string, expectedElements: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    let existingElements: string[] = [];
    switch (elements) {
      case 'buttons':
      case 'button':
        existingElements = await moderatorToolsPage.getAllButtonsInnerText();
        break;

      case 'menu items':
        existingElements = await moderatorToolsPage.getAllMenuItemsInnerText();
        break;
    }

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

Then(
  'a {string} field should be displayed in the open moderator tool for {string}',
  async function (this: CustomWorld, expectedField: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await expect(await moderatorToolsPage.getTextboxByLabel(expectedField)).toBeVisible();
  }
);

Then(
  'these participants should be displayed with checkboxes in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, expectedParticipants: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    const participantList = new ParticipantListWithCheckboxesPage({ page: moderatorToolsPage.page });
    for (const participant of expectedParticipants.raw().flat()) {
      await expect(participantList.getParticipantItemByName(participant)).toBeVisible();
    }
  }
);

Then(
  'these fields should be displayed in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, labels: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    for (const label of labels.raw().flat()) {
      await expect(await moderatorToolsPage.getTextboxByLabel(label)).toBeVisible();
    }
  }
);
