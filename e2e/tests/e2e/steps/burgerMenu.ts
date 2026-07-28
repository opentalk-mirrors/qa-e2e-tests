// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Then } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
import { GlitchTipPage } from '../../pages/MeetingRoom/GlitchTipPage';
import { CustomWorld } from '../cucumberWorld';

let glitchTipPage: GlitchTipPage;

Then(
  /^for "([^"]*)" the GlitchTip pop-up (should|should not) be displayed/,
  async function (this: CustomWorld, user: string, actionType: 'should' | 'should not') {
    const meeting = this.getStartedMeeting(user).meeting;
    glitchTipPage = new GlitchTipPage({ page: meeting.meetingRoomPage.page });
    if (actionType === 'should') {
      await assert(
        glitchTipPage.glitchTipPopup,
        'toBeVisible',
        undefined,
        `Expected to have glitch tip popup to be visible`
      );
    } else {
      await assert(
        glitchTipPage.glitchTipPopup,
        'not toBeVisible',
        undefined,
        `Didn't expect to have glitch tip popup to be visible`
      );
    }
  }
);
