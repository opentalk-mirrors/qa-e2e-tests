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
  'these buttons should be displayed in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, expectedButtons: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    const existingButtons = await moderatorToolsPage.getAllButtonsInnerText();
    for (const expectedButton of expectedButtons.raw().flat()) {
      let buttonFound = false;
      for (const existingButton of existingButtons) {
        if (expectedButton === existingButton) {
          buttonFound = true;
          break;
        }
      }
      assert(buttonFound, `could not find the button '${expectedButton}'`);
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
