// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When } from '@cucumber/cucumber';

import { CustomWorld } from '../cucumberWorld';

When('{string} opens the Mute Participants moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startMuteParticipantsModeratorTool();
});
