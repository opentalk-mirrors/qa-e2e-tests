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
    expect(await coffeeBreakPage.getSessionDuration()).toBe('5 min');
    await expect(coffeeBreakPage.startCoffeeBreakButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Coffee break_Duration_Session Duration', async ({ page }) => {
    ({ meetingRoomPage } = await startAdhocMeetingAsModerator(page));
    // preconditions
    await meetingRoomPage.page.bringToFront();
    coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();

    // test start
    let sessionDurationDialog = await coffeeBreakPage.openSessionDurationDialog();
    expect(await coffeeBreakPage.isSessionDurationDialogVisible()).toBeTruthy();
    await expect(sessionDurationDialog.title).toHaveText('Session Duration');
    expect(await coffeeBreakPage.areAllDurationOptionsVisible()).toBeTruthy();
    await expect(sessionDurationDialog.closeButton).toBeVisible();
    await expect(sessionDurationDialog.saveButton).toBeVisible();

    await sessionDurationDialog.selectDuration(fiveMinute);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(fiveMinute);
    await sessionDurationDialog.selectDuration(tenMinute);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(tenMinute);
    await sessionDurationDialog.selectDuration(fifteenMinute);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(fifteenMinute);
    await sessionDurationDialog.selectDuration(thirtyMinute);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(thirtyMinute);

    await sessionDurationDialog.save();
    expect(await coffeeBreakPage.isSessionDurationDialogVisible()).toBeFalsy();
    await expect(coffeeBreakPage.durationButton).toContainText(thirtyMinute);

    sessionDurationDialog = await coffeeBreakPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration(custom);
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe(custom);
    await expect(sessionDurationDialog.customDurationLabel).toBeVisible();
    await expect(sessionDurationDialog.customDurationButtonInput).toBeVisible();
    await expect(sessionDurationDialog.customDurationButtonInput).toHaveValue('5');

    await sessionDurationDialog.activateCustomDurationInput();
    await expect(sessionDurationDialog.customDurationButtonInput).toBeFocused();
    await expect(sessionDurationDialog.customDurationButtonInput).toBeEditable();

    await sessionDurationDialog.setCustomDuration('20');
    await expect(sessionDurationDialog.customDurationButtonInput).toHaveValue('20');
    await sessionDurationDialog.incrementCustomDuration();
    await expect(sessionDurationDialog.customDurationButtonInput).toHaveValue('21');
    await sessionDurationDialog.save();
    expect(await coffeeBreakPage.isSessionDurationDialogVisible()).toBeFalsy();
    await expect(coffeeBreakPage.durationButton).toContainText('21');

    sessionDurationDialog = await coffeeBreakPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration(fifteenMinute);
    await sessionDurationDialog.close();
    expect(await coffeeBreakPage.isSessionDurationDialogVisible()).toBeFalsy();
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
    expect(await meetingRoomPage.isTimerCountingDown(dialogPage.timerText)).toBeTruthy();
    await expect(dialogPage.backToConferenceButton).toBeVisible();
  }

  test('TC_003_Meeting Room_As Moderator_Coffee break_Start coffee break_with different Durations', async ({
    page,
    context,
    browserName,
  }) => {
    // preconditions
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    guestMeetingRoomPage = participantMeetingRoomPages['guest'];
    // TODO: Need to add pre-condition to join meeting as few invited participants, once invited user scenario is implemented
    await meetingRoomPage.page.bringToFront();
    coffeeBreakPage = await meetingRoomPage.selectCoffeeBreakModeratorTool();

    // test start
    let sessionDurationDialog = await coffeeBreakPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration(fiveMinute);
    await sessionDurationDialog.save();
    sessionDurationDialog = await coffeeBreakPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration(custom);
    await sessionDurationDialog.activateCustomDurationInput();
    await sessionDurationDialog.setCustomDuration('2');
    await sessionDurationDialog.decrementCustomDuration();
    await sessionDurationDialog.save();
    const coffeeBreakDialogPage = await coffeeBreakPage.selectStartCoffeeBreakButton();
    await assertCoffeeBreakDialog(coffeeBreakDialogPage);
    await guestMeetingRoomPage.page.bringToFront();
    const guestCoffeeBreakDialogPage = new CoffeeBreakDialogPage({ page: guestMeetingRoomPage.page });
    await assertCoffeeBreakDialog(guestCoffeeBreakDialogPage);

    await meetingRoomPage.page.bringToFront();
    await expect(coffeeBreakPage.heading).toBeVisible();
    expect(await coffeeBreakPage.getHeadingText()).toBe('Coffee break');
    await expect(sessionDurationDialog.durationLabel).toBeVisible();
    await expect(coffeeBreakPage.timerText).toBeVisible();
    await expect(coffeeBreakPage.timerText).toHaveText(/^$|^\d{2}\s*:\s*\d{2}$/);
    expect(await meetingRoomPage.isTimerCountingDown(coffeeBreakPage.timerText)).toBeTruthy();
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
