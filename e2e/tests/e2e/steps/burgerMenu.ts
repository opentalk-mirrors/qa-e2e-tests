// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { GlitchTipPage } from '../../pages/MeetingRoom/GlitchTipPage';
import { CustomWorld } from '../cucumberWorld';

let glitchTipPage: GlitchTipPage;

Then(
  /^for "([^"]*)" the glitchTip popup (should|should not) be displayed/,
  async function (this: CustomWorld, user: string, actionType: 'should' | 'should not') {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage(meeting.meetingRoomPage.page);
    if (actionType === 'should') {
      expect(await glitchTipPage.glitchTipPopup).toBeVisible();
    } else {
      expect(await glitchTipPage.glitchTipPopup).not.toBeVisible();
    }
  }
);
