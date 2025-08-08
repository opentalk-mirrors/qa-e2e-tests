// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { CoffeeBreakPage } from '../../../pages/MeetingRoom/ModeratorTools/CoffeeBreakPage';

test.describe('Meeting room_Coffee break', async () => {
  let meetingRoomPage: MeetingRoomPage, coffeeBreakPage: CoffeeBreakPage;

  test.describe('Meeting room as moderator coffee break', async () => {
    test.beforeEach(async ({ page }) => {
      ({ meetingRoomPage } = await startAdhocMeetingAsModerator(page));
      await meetingRoomPage.page.bringToFront();
    });

    test('TC_001_Meeting Room_As Moderator_Coffee break', async () => {
      coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();
      await expect(coffeeBreakPage.getHeading('Coffee Break')).toBeVisible();
      await expect(coffeeBreakPage.durationButton).toHaveText('5 min');
      await expect(coffeeBreakPage.startCoffeeBreakButton).toBeVisible();
    });
  });
});
