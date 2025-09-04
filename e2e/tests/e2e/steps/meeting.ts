// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given } from '@cucumber/cucumber';

import { startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { CustomWorld } from '../cucumberWorld';

Given(
  '{string} has started an ad-hoc meeting and joined the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    if (this.currentUser !== username) {
      throw new Error(`Expected ${username} but current user is ${this.currentUser}`);
    }

    this.lastCreatedMeeting = await startAdhocMeetingAsModerator(this.page);
  }
);
