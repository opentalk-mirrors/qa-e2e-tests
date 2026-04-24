// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import test, { expect } from '@playwright/test';

import { globalSetup } from '../../authHelpers';
import { config } from '../../config';
import { deleteUser } from '../../helper/keycloak';
import { startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { BurgerMenuPage } from '../../pages/MeetingRoom/BurgerMenuPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { ViewOptionsPage } from '../../pages/MeetingRoom/ViewOptionsPage';

test.describe('Meeting Room_Burger menu', { tag: '@late' }, () => {
  let userId = '';
  let meetingRoomPage: MeetingRoomPage;

  test.beforeEach(async ({ page, context, browserName }, testInfo) => {
    userId = await globalSetup(page, context, testInfo);
    meetingRoomPage = (await startAdhocMeetingAsModerator(page, browserName)).meetingRoomPage;
  });

  test.afterEach(async () => {
    await deleteUser(userId);
  });

  test('TC_001_Accessibility', async () => {
    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();

    await expect(burgerMenuPage.accessibilityMenuItem).toBeVisible();
    await expect(burgerMenuPage.userManualMenuItem).toBeVisible();
    await expect(burgerMenuPage.keyboardShortcutsMenuItem).toBeVisible();
    await expect(burgerMenuPage.reportABugMenuItem).toBeVisible();

    const accessibilityPage = await burgerMenuPage.gotoAccessibility();
    const accessibilityHeading = accessibilityPage.getByRole('heading', {
      name: 'Accessibility statement',
      exact: true,
    });
    const openTalkInformationHeading = accessibilityPage.getByRole('heading', {
      name: 'Accessibility statement for the OpenTalk video conferencing solution',
      exact: true,
    });
    expect(accessibilityPage.url()).toBe('https://opentalk.eu/en/accessibility-statement');
    await expect(accessibilityHeading).toBeVisible();
    await expect(openTalkInformationHeading).toBeVisible();

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
  });

  test('TC_002_User manual', async () => {
    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();

    await expect(burgerMenuPage.accessibilityMenuItem).toBeVisible();
    await expect(burgerMenuPage.userManualMenuItem).toBeVisible();
    await expect(burgerMenuPage.keyboardShortcutsMenuItem).toBeVisible();
    await expect(burgerMenuPage.reportABugMenuItem).toBeVisible();

    const userManualPage = await burgerMenuPage.gotoUserManual();
    const userManualHeading = userManualPage.getByRole('heading', { name: 'User manual', exact: true });
    const openTalkDocs = userManualPage.getByText(
      'Please contact your admin if this manual leaves any questions unanswered or if you have found a technical error. We hope you enjoy using OpenTalk!',
      { exact: true }
    );
    expect(userManualPage.url()).toMatch(/^https:\/\/docs\.opentalk\.eu\/.*$/);
    await expect(userManualHeading).toBeVisible({ timeout: config.SHORT_TIMEOUT });
    await expect(openTalkDocs).toBeVisible();

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
  });

  test('TC_003_Keyboard Shortcuts', async ({ browserName }) => {
    test.skip(browserName === 'webkit'); // Camera and Microphone permissions are not being granted in Safari in CI

    // The test has been temporarily commented out due to:
    // https://git.opentalk.dev/opentalk/qa/to-do/-/work_items/142
    // const participantMeetingRoomPages = await joinMeetingRoomAsGuest(browser, guestLink, 'guest');
    // const guestMeetingRoomPage = participantMeetingRoomPages['guest'];
    const viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });
    await meetingRoomPage.page.bringToFront();

    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();
    await expect(burgerMenuPage.burgerMenuDropdown).toBeVisible();

    await burgerMenuPage.openKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).toBeVisible();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).toBeChecked();
    await meetingRoomPage.closePopupDialog();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape(); // escaping burgermenu because it does not allow to locate elements

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+m');
    await expect
      .poll(async () => {
        return await meetingRoomPage.isAudioOn();
      })
      .toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+m');
    await expect
      .poll(async () => {
        return await meetingRoomPage.isAudioOn();
      })
      .toBeFalsy();
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+v');
    await expect
      .poll(async () => {
        return await meetingRoomPage.isCameraOn();
      })
      .toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+v');
    await expect
      .poll(async () => {
        return await meetingRoomPage.isCameraOn();
      })
      .toBeFalsy();

    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+f');
    await expect
      .poll(async () => {
        return await viewOptionsPage.isFullScreen();
      })
      .toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+f');
    await expect
      .poll(async () => {
        return await viewOptionsPage.isFullScreen();
      })
      .toBeFalsy();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.holdToSpeak();
    await expect
      .poll(async () => {
        return await meetingRoomPage.isAudioOn();
      })
      .toBeTruthy();
    await meetingRoomPage.releaseHoldToSpeak();
    await expect
      .poll(async () => {
        return await meetingRoomPage.isAudioOn();
      })
      .toBeFalsy();

    // The test has been temporarily commented out due to:
    // https://git.opentalk.dev/opentalk/qa/to-do/-/work_items/142
    // const talkingStickPage = new TalkingStickPage({ page });
    // await talkingStickPage.openTalkingStickPage();
    // await talkingStickPage.startTalkingStick();
    // await expect(talkingStickPage.talkingStickStartedNotification).toBeVisible();
    // await expect(talkingStickPage.yourTurnPopup).toBeVisible();

    // await meetingRoomPage.useKeyboardShortcut('n');
    // await expect(talkingStickPage.yourTurnPopup).not.toBeVisible();
    // await guestMeetingRoomPage.page.bringToFront();
    // const guestTalkingStickPage = new TalkingStickPage({ page: guestMeetingRoomPage.page });
    // await expect(guestTalkingStickPage.yourTurnPopup).toBeVisible();
    // await guestMeetingRoomPage.useKeyboardShortcut('n');
    // await meetingRoomPage.page.bringToFront();

    await meetingRoomPage.openBurgerMenu();
    await burgerMenuPage.openKeyboardShortcuts();
    await meetingRoomPage.deactivateKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).not.toBeChecked();
    await meetingRoomPage.pressEscape();
    await expect(meetingRoomPage.keyboardShortcuts.keyboardShortcutsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+m');
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+v');
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();

    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('Control+Shift+f');
    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();

    // The test has been temporarily commented out due to:
    // https://git.opentalk.dev/opentalk/qa/to-do/-/work_items/142
    // await talkingStickPage.startTalkingStick();
    // await expect(talkingStickPage.yourTurnPopup).toBeVisible();
    // await meetingRoomPage.useKeyboardShortcut('n');
    // await expect(talkingStickPage.yourTurnPopup).toBeVisible();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.holdToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
  });

  test('TC_005_Report a Bug', async ({ page, browserName }) => {
    const closingMethods = ['BTN_esc', 'BTN_x', 'outside the window'];
    for (const method of closingMethods) {
      const { meetingRoomPage } = await startAdhocMeetingAsModerator(page);
      if (browserName === 'webkit') {
        await closeWebkitPopUp({ page });
      }
      const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();
      await expect(burgerMenuPage.burgerMenuDropdown).toBeVisible();

      await burgerMenuPage.openReportABug();
      await expect(meetingRoomPage.reportABug.manualGlitchtipPopup).toBeVisible();

      await meetingRoomPage.closePopupDialog(method);
      await expect(meetingRoomPage.reportABug.manualGlitchtipPopup).not.toBeVisible();
      await meetingRoomPage.closeBurgerMenu();
    }
  });
});
