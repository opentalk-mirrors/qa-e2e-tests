// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { SessionDurationDialog } from '../../pages/MeetingRoom/ModeratorTools/SessionDurationDialog';
import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { CustomWorld } from '../cucumberWorld';

When(
  '{string} selects {string} duration in the duration dialog in the moderator tool',
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorRoomPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    if (!(await moderatorRoomPage.isSessionDurationDialogVisible())) {
      await moderatorRoomPage.openSessionDurationDialog();
    }
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await sessionDurationDialog.selectDuration(duration);
  }
);

When(
  '{string} saves the selected duration in the duration dialog in the moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await sessionDurationDialog.save();
  }
);

When(
  '{string} sets {string} as the custom duration in the duration dialog in the moderator tool',
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await sessionDurationDialog.setCustomDuration(duration);
  }
);

When(
  /"([^"]*)" (decrements|increments) the custom duration (\d+) times in the duration dialog in the moderator tool/,
  async function (this: CustomWorld, user: string, method: 'increments' | 'decrements', times: number) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);

    if (method === 'decrements') {
      for (let i = 0; i < times; i++) {
        await sessionDurationDialog.decrementCustomDuration();
      }
    } else {
      for (let i = 0; i < times; i++) {
        await sessionDurationDialog.incrementCustomDuration();
      }
    }
  }
);

When(
  '{string} closes the session duration dialog in the open moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await sessionDurationDialog.close();
  }
);

Then(
  'the heading in the session duration dialog should be {string} in the open moderator tool for {string}',
  async function (this: CustomWorld, title: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await expect(sessionDurationDialog.title).toHaveText(title);
  }
);

Then(
  /the duration field in the open moderator tool for "([^"]+)" should be set to "([^"]+)"/,
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorRoomPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    await expect(moderatorRoomPage.durationButton).toHaveText(duration);
  }
);

Then(
  'the {string} duration should be selected in the duration dialog in the moderator tool for {string}',
  async function (this: CustomWorld, duration: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(duration);
  }
);

Then(
  'the session duration dialog should not be displayed in the open moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorRoomPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });
    expect(await moderatorRoomPage.isSessionDurationDialogVisible()).toBeFalsy();
  }
);

Then(
  'the input box {string} with the value {string} should be displayed in the duration dialog in the moderator tool for {string}',
  async function (this: CustomWorld, text: string, expectedValue: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const sessionDurationDialog = new SessionDurationDialog(meeting.meetingRoomPage.page);
    await expect(sessionDurationDialog.customDurationLabel).toHaveText(text);
    await expect(sessionDurationDialog.customDurationButtonInput).toBeVisible();
    await expect(sessionDurationDialog.customDurationButtonInput).toHaveValue(expectedValue);
  }
);
