// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When } from '@cucumber/cucumber';

import { BurgerMenuPage } from '../../pages/MeetingRoom/BurgerMenuPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { CustomWorld } from '../cucumberWorld';

let meetingRoomPage: MeetingRoomPage;
let burgerMenuPage: BurgerMenuPage;

When('{string} opens the "Report a bug" form', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  meetingRoomPage = meeting.meetingRoomPage;
  burgerMenuPage = await meetingRoomPage.openBurgerMenu();
  await burgerMenuPage.openReportABug();
});
