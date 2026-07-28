// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { validateDataTableHeaders } from '../../helper/helper';
import { GlitchTipPage } from '../../pages/MeetingRoom/GlitchTipPage';
import { CustomWorld } from '../cucumberWorld';

let glitchTipPage: GlitchTipPage;

When('{string} closes the GlitchTip pop-up', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  glitchTipPage = new GlitchTipPage({ page: meeting.meetingRoomPage.page });
  await glitchTipPage.closePopup();
});

When('{string} sends a crash report', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  glitchTipPage = new GlitchTipPage({ page: meeting.meetingRoomPage.page });
  this.getStartedMeeting(user).crashReportResponse = await glitchTipPage.sendCrashReport();
});

When(
  '{string} sends a crash report with these details:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage({ page: meeting.meetingRoomPage.page });
    const expectedHeaders = ['name', 'email', 'description'];
    validateDataTableHeaders(dataTable, expectedHeaders);
    const { name, email, description } = dataTable.hashes()[0];
    await glitchTipPage.enterName(name);
    await glitchTipPage.enterEmail(email);
    await glitchTipPage.enterDescription(description);

    this.getStartedMeeting(user).crashReportResponse = await glitchTipPage.sendCrashReport();
  }
);

Then('for {string} no request should have been sent to GlitchTip', async function (this: CustomWorld, user: string) {
  await assert(
    this.getStartedMeeting(user).crashReportResponse,
    'toBeUndefined',
    undefined,
    `Didn't expect glitchtip to send crash report`
  );
});

Then(
  'for {string} a request to GlitchTip should have been sent and a response with status code 200 should have been received',
  async function (this: CustomWorld, user: string) {
    const responseCode = this.getStartedMeeting(user).crashReportResponse?.status();
    await assert(responseCode, 'toBe', 200, `Expected request to GlitchTip to be successful but got ${responseCode}`);
  }
);

Then(
  'for {string} sending successful pop-up should be displayed with text {string}',
  async function (this: CustomWorld, user: string, text: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage({ page: meeting.meetingRoomPage.page });
    await assert(glitchTipPage.sendingSuccessfulPopup, 'toBeVisible', undefined, `Expected pop-up to be displayed`);

    const actualText = await glitchTipPage.getSendingSuccessfulPopupText();
    const subTexts = text.split(/\\n/);
    for (const subText of subTexts) {
      await assert(actualText, 'toContain', subText, `Expected to get text '${subText}' but got '${actualText}'`);
    }
  }
);
