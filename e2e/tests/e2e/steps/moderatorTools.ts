// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Then, When } from '@cucumber/cucumber';
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

      case 'options':
        existingElements = await moderatorToolsPage.getAllDropdownOptionsInnerText();
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
    await expect(moderatorToolsPage.getTextboxByLabel(expectedField)).toBeVisible();
  }
);

Then(
  'these participants should be displayed with checkboxes in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, expectedParticipants: DataTable) {
    const participants = expectedParticipants.raw().flat();
    const participantListPage = await expectParticipantListWithCheckboxesToHaveCount(this, user, participants.length);
    for (const participant of participants) {
      await expect(participantListPage.getParticipantItemByName(participant)).toBeVisible();
    }
  }
);

Then(
  '{int} participants should be displayed with checkboxes in the open moderator tool for {string}',
  async function (this: CustomWorld, expectedCount: number, user: string) {
    await expectParticipantListWithCheckboxesToHaveCount(this, user, expectedCount);
  }
);

async function expectParticipantListWithCheckboxesToHaveCount(
  world: CustomWorld,
  moderator: string,
  expectedCount: number
): Promise<ParticipantListWithCheckboxesPage> {
  const meeting = world.getStartedMeeting(moderator).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
  const participantList = new ParticipantListWithCheckboxesPage({ page: moderatorToolsPage.page });
  await expect(participantList.participantList).toHaveCount(expectedCount);
  return participantList;
}

Then(
  'these fields should be displayed in the open moderator tool for {string}:',
  async function (this: CustomWorld, user: string, labels: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    for (const label of labels.raw().flat()) {
      await expect(moderatorToolsPage.getTextboxByLabel(label)).toBeVisible();
    }
  }
);

When(
  '{string} selects the {string} field in the open moderator tool',
  async function (this: CustomWorld, user: string, textField: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await moderatorToolsPage.selectField(textField);
  }
);

Then(
  'the {string} field with placeholder text {string} should be displayed in the open moderator tool for {string}',
  async function (this: CustomWorld, textField: string, placeholder: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    expect(await moderatorToolsPage.getFieldPlaceholderValue(textField)).toBe(placeholder);
  }
);

When(
  '{string} types text {string} in the {string} field in the open moderator tool',
  async function (this: CustomWorld, user: string, text: string, textField: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await moderatorToolsPage.enterFieldValue(textField, text);
  }
);

Then(
  'the text {string} should be displayed in the {string} field in the open moderator tool for {string}',
  async function (this: CustomWorld, text: string, textField: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    expect(await moderatorToolsPage.getFieldInputValue(textField)).toBe(text);
  }
);

When(
  /"([^"]*)" toggles "([^"]*)" in the open moderator tool/,
  async function (this: CustomWorld, user: string, switchName: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await moderatorToolsPage.toggleSwitch(switchName);
  }
);

When(
  '{string} selects {string} option in the open moderator tool',
  async function (this: CustomWorld, user: string, option: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await moderatorToolsPage.selectDropdownOption(option);
  }
);

When(
  '{string} opens the session duration dialog in the moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await moderatorToolsPage.openSessionDurationDialog();
  }
);
