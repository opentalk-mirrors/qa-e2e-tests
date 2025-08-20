// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { GlitchTipPage } from '../../pages/MeetingRoom/GlitchTipPage';
import { CustomWorld } from '../cucumberWorld';

let glitchTipPage: GlitchTipPage;

When('{string} closes the glitchTip popup', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  glitchTipPage = new GlitchTipPage(meeting.meetingRoomPage.page);
  await glitchTipPage.closePopup();
});

When('{string} sends a crash report', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  glitchTipPage = new GlitchTipPage(meeting.meetingRoomPage.page);
  this.getStartedMeeting(user).crashReportResponse = await glitchTipPage.sendCrashReport();
});

When(
  '{string} sends a crash report with these details:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage(meeting.meetingRoomPage.page);

    const { name, email, description } = dataTable.hashes()[0];
    await glitchTipPage.enterName(name);
    await glitchTipPage.enterEmail(email);
    await glitchTipPage.enterDescription(description);

    this.getStartedMeeting(user).crashReportResponse = await glitchTipPage.sendCrashReport();
  }
);

Then('for {string} no request should have been send to glitchtip', async function (this: CustomWorld, user: string) {
  expect(this.getStartedMeeting(user).crashReportResponse).toBeUndefined();
});

Then(
  'for {string} a request to glitchtip should have been send and a response with status code 200 should have been received',
  async function (this: CustomWorld, user: string) {
    expect(this.getStartedMeeting(user).crashReportResponse?.status()).toBe(200);
  }
);

Then(
  'for {string} sending successful popup should be displayed with text {string}',
  async function (this: CustomWorld, user: string, text: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage(meeting.meetingRoomPage.page);
    await expect(glitchTipPage.sendingSuccessfulPopup).toBeVisible();

    const actualText = await glitchTipPage.getSendingSuccessfulPopupText();
    const subTexts = text.split(/\\n/);
    for (const subText of subTexts) {
      expect(actualText).toContain(subText);
    }
  }
);
