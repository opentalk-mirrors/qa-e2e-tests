// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { CoffeeBreakDialogPage } from '../../../pages/MeetingRoom/CoffeeBreakDialogPage';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { CoffeeBreakPage } from '../../../pages/MeetingRoom/ModeratorTools/CoffeeBreakPage';
import { NotificationPage } from '../../../pages/NotificationPage';

test.describe('Meeting room_Coffee break', async () => {
  const fiveMinute = '5 min',
    tenMinute = '10 min',
    fifteenMinute = '15 min',
    thirtyMinute = '30 min',
    custom = 'Custom';

  const coffeeBreakOverNotificationText = 'The coffee break is over.';

  let meetingRoomPage: MeetingRoomPage,
    coffeeBreakPage: CoffeeBreakPage,
    guestLink: string,
    guestMeetingRoomPage: MeetingRoomPage;

  test('TC_001_Meeting Room_As Moderator_Coffee break', async ({ page }) => {
    ({ meetingRoomPage } = await startAdhocMeetingAsModerator(page));
    // preconditions
    await meetingRoomPage.page.bringToFront();
    coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();

    // test start
    await expect(coffeeBreakPage.heading).toBeVisible();
    expect(await coffeeBreakPage.getHeadingText()).toBe('Coffee break');
    await expect(coffeeBreakPage.durationButton).toHaveText('5 min');
    await expect(coffeeBreakPage.startCoffeeBreakButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Coffee break_Duration_Session Duration', async ({ page }) => {
    ({ meetingRoomPage } = await startAdhocMeetingAsModerator(page));
    // preconditions
    await meetingRoomPage.page.bringToFront();
    coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();

    // test start
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

  async function assertCoffeeBreakDialog(dialogPage: CoffeeBreakDialogPage) {
    expect(await dialogPage.isCoffeeBreakDialogOpen()).toBeTruthy();
    await expect(dialogPage.openTalkLogo).toBeVisible();
    await expect(dialogPage.coffeeBreakIcon).toBeVisible();
    await expect(dialogPage.coffeeBreakText).toHaveText('Coffee break! Time left:');
    await expect(dialogPage.timerText).toBeVisible();
    await expect(dialogPage.timerText).toHaveText(/^$|^\d{2}\s*:\s*\d{2}$/);
    expect(await dialogPage.isTimerCountingDown()).toBeTruthy();
    await expect(dialogPage.backToConferenceButton).toBeVisible();
  }

  test('TC_003_Meeting Room_As Moderator_Coffee break_Start coffee break_with different Durations', async ({
    page,
    context,
    browserName,
  }) => {
    // preconditions
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    guestMeetingRoomPage = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    // TODO: Need to add pre-condition to join meeting as few invited participants, once invited user scenario is implemented
    await meetingRoomPage.page.bringToFront();
    coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();

    // test start
    await coffeeBreakPage.openDurationDialog();
    await coffeeBreakPage.selectDurationOption(fiveMinute);
    await coffeeBreakPage.save();
    await coffeeBreakPage.openDurationDialog();
    await coffeeBreakPage.selectDurationOption(custom);
    await coffeeBreakPage.selectCustomDurationField();
    await coffeeBreakPage.selectCustomValue('2');
    await coffeeBreakPage.decrementCustomDuration();
    await coffeeBreakPage.save();
    const coffeeBreakDialogPage = await coffeeBreakPage.selectStartCoffeeBreakButton();
    await assertCoffeeBreakDialog(coffeeBreakDialogPage);
    await guestMeetingRoomPage.page.bringToFront();
    const guestCoffeeBreakDialogPage = new CoffeeBreakDialogPage({ page: guestMeetingRoomPage.page });
    await assertCoffeeBreakDialog(guestCoffeeBreakDialogPage);

    await meetingRoomPage.page.bringToFront();
    await expect(coffeeBreakPage.heading).toBeVisible();
    expect(await coffeeBreakPage.getHeadingText()).toBe('Coffee break');
    await expect(coffeeBreakPage.durationLabel).toBeVisible();
    await expect(coffeeBreakPage.timerText).toBeVisible();
    await expect(coffeeBreakPage.timerText).toHaveText(/^$|^\d{2}\s*:\s*\d{2}$/);
    expect(await coffeeBreakPage.isTimerCountingDown()).toBeTruthy();
    await expect(coffeeBreakPage.stopCoffeeBreakButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.timerButton).toBeDisabled();

    await coffeeBreakDialogPage.waitForCoffeeBreakToEnd();
    expect(await coffeeBreakDialogPage.isCoffeeBreakDialogClosed()).toBeTruthy();
    const moderatorNotification = new NotificationPage({ page: page });
    expect(await moderatorNotification.getAlertNotificationText()).toBe(coffeeBreakOverNotificationText);
    await guestMeetingRoomPage.page.bringToFront();
    expect(await guestCoffeeBreakDialogPage.isCoffeeBreakDialogClosed()).toBeTruthy();
    const guestNotification = new NotificationPage({ page: guestMeetingRoomPage.page });
    expect(await guestNotification.getAlertNotificationText()).toBe(coffeeBreakOverNotificationText);
    await meetingRoomPage.page.bringToFront();
    await expect(coffeeBreakPage.heading).toBeVisible();
    expect(await coffeeBreakPage.getHeadingText()).toBe('Coffee break');
    await expect(coffeeBreakPage.startCoffeeBreakButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.timerButton).toBeEnabled();
  });
});
