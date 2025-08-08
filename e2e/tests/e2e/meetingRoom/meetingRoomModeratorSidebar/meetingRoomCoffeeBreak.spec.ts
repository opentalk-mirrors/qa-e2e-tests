// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { CoffeeBreakPage } from '../../../pages/MeetingRoom/ModeratorTools/CoffeeBreakPage';

test.describe('Meeting room_Coffee break', async () => {
  const fiveMinute = '5 min',
    tenMinute = '10 min',
    fifteenMinute = '15 min',
    thirtyMinute = '30 min',
    custom = 'Custom';

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

  test.describe('Meeting room as moderator coffee break duration session duration', async () => {
    test.beforeEach(async ({ page }) => {
      ({ meetingRoomPage } = await startAdhocMeetingAsModerator(page));
      await meetingRoomPage.page.bringToFront();
      coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();
    });

    test('TC_002_Meeting Room_As Moderator_Coffee break_Duration_Session Duration', async () => {
      await coffeeBreakPage.openDurationDialog();
      expect(await coffeeBreakPage.isDurationDialogOpen()).toBeTruthy();
      await expect(coffeeBreakPage.sessionDurationTitle).toHaveText('Session Duration');
      expect(await coffeeBreakPage.areAllDurationOptionsVisible()).toBeTruthy();
      await expect(coffeeBreakPage.closeButton).toBeVisible();
      await expect(coffeeBreakPage.saveButton).toBeVisible();

      await coffeeBreakPage.selectDurationOption(fiveMinute);
      expect(await coffeeBreakPage.getSelectedDurationText()).toBe(fiveMinute);
      await coffeeBreakPage.selectDurationOption(tenMinute);
      expect(await coffeeBreakPage.getSelectedDurationText()).toBe(tenMinute);
      await coffeeBreakPage.selectDurationOption(fifteenMinute);
      expect(await coffeeBreakPage.getSelectedDurationText()).toBe(fifteenMinute);
      await coffeeBreakPage.selectDurationOption(thirtyMinute);
      expect(await coffeeBreakPage.getSelectedDurationText()).toBe(thirtyMinute);

      await coffeeBreakPage.save();
      expect(await coffeeBreakPage.isDurationDialogClosed()).toBeTruthy();
      await expect(coffeeBreakPage.durationButton).toContainText(thirtyMinute);

      await coffeeBreakPage.openDurationDialog();
      await coffeeBreakPage.selectDurationOption(custom);
      expect(await coffeeBreakPage.getSelectedDurationText()).toBe(custom);
      await expect(coffeeBreakPage.customDurationLabel).toBeVisible();
      await expect(coffeeBreakPage.customDurationField).toBeVisible();
      await expect(coffeeBreakPage.customDurationField).toHaveValue('5');

      await coffeeBreakPage.selectCustomDurationField();
      await expect(coffeeBreakPage.customDurationField).toBeFocused();
      await expect(coffeeBreakPage.customDurationField).toBeEditable();

      await coffeeBreakPage.selectCustomValue('20');
      await expect(coffeeBreakPage.customDurationField).toHaveValue('20');
      await coffeeBreakPage.incrementCustomDuration();
      await expect(coffeeBreakPage.customDurationField).toHaveValue('21');
      await coffeeBreakPage.save();
      expect(await coffeeBreakPage.isDurationDialogClosed()).toBeTruthy();
      await expect(coffeeBreakPage.durationButton).toContainText('21');

      await coffeeBreakPage.openDurationDialog();
      await coffeeBreakPage.selectDurationOption(fifteenMinute);
      await coffeeBreakPage.close();
      expect(await coffeeBreakPage.isDurationDialogClosed()).toBeTruthy();
      await expect(coffeeBreakPage.durationButton).not.toContainText('15');
      await expect(coffeeBreakPage.durationButton).toContainText('21');
    });
  });
});
