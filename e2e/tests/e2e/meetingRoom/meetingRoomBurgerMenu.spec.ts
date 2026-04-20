// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import test, { expect } from '@playwright/test';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { BurgerMenuPage } from '../../pages/MeetingRoom/BurgerMenuPage';
import { TalkingStickPage } from '../../pages/MeetingRoom/ModeratorTools/TalkingStickPage';
import { ViewOptionsPage } from '../../pages/MeetingRoom/ViewOptionsPage';

test.describe('Meeting Room_Burger menu', { tag: '@late' }, () => {
  test('TC_001_Accessibility', async ({ page, browserName }) => {
    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page, browserName);
    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();

    await expect(burgerMenuPage.accessibilityMenuItem).toBeVisible();
    await expect(burgerMenuPage.userManualMenuItem).toBeVisible();
    await expect(burgerMenuPage.hotkeySettingsMenuItem).toBeVisible();
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

  test('TC_002_User manual', async ({ page, browserName }) => {
    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page, browserName);
    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();

    await expect(burgerMenuPage.accessibilityMenuItem).toBeVisible();
    await expect(burgerMenuPage.userManualMenuItem).toBeVisible();
    await expect(burgerMenuPage.hotkeySettingsMenuItem).toBeVisible();
    await expect(burgerMenuPage.reportABugMenuItem).toBeVisible();

    const userManualPage = await burgerMenuPage.gotoUserManual();
    const userManualHeading = userManualPage.getByRole('heading', { name: 'User manual', exact: true });
    const openTalkDocs = userManualPage.getByText(
      'Please contact your admin if this manual leaves any questions unanswered or if you have found a technical error. We hope you enjoy using OpenTalk!',
      { exact: true }
    );
    expect(userManualPage.url()).toMatch(/^https:\/\/docs\.opentalk\.eu\/.*$/);
    await expect(userManualHeading).toBeVisible();
    await expect(openTalkDocs).toBeVisible();

    await meetingRoomPage.page.bringToFront();
    await expect(meetingRoomPage.meetingRoomName).toBeVisible();
  });

  test('TC_003_Keyboard Shortcuts', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit'); // Camera and Microphone permissions are not being granted in Safari in CI

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(context, guestLink, 'guest');
    const guestMeetingRoomPage = participantMeetingRoomPages['guest'];
    const viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });
    await meetingRoomPage.page.bringToFront();

    const burgerMenuPage: BurgerMenuPage = await meetingRoomPage.openBurgerMenu();
    await expect(burgerMenuPage.burgerMenuDropdown).toBeVisible();

    await burgerMenuPage.openKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.hotkeySettingsPopup).toBeVisible();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).toBeChecked();
    await meetingRoomPage.closePopupDialog();
    await expect(meetingRoomPage.keyboardShortcuts.hotkeySettingsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape(); // escaping burgermenu because it does not allow to locate elements

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();

    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await viewOptionsPage.isFullScreen()).toBeTruthy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.holdToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeTruthy();
    await meetingRoomPage.releaseHoldToSpeak();
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    const talkingStickPage = new TalkingStickPage({ page });
    await talkingStickPage.openTalkingStickPage();
    await talkingStickPage.startTalkingStick();
    await expect(talkingStickPage.talkingStickStartedNotification).toBeVisible();
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();

    await meetingRoomPage.useKeyboardShortcut('n');
    await expect(talkingStickPage.yourTurnPopup).not.toBeVisible();
    await guestMeetingRoomPage.page.bringToFront();
    const guestTalkingStickPage = new TalkingStickPage({ page: guestMeetingRoomPage.page });
    await expect(guestTalkingStickPage.yourTurnPopup).toBeVisible();
    await guestMeetingRoomPage.useKeyboardShortcut('n');
    await meetingRoomPage.page.bringToFront();

    await meetingRoomPage.openBurgerMenu();
    await burgerMenuPage.openKeyboardShortcuts();
    await meetingRoomPage.deactivateKeyboardShortcuts();
    await expect(meetingRoomPage.keyboardShortcuts.checkbox).not.toBeChecked();
    await meetingRoomPage.pressEscape();
    await expect(meetingRoomPage.keyboardShortcuts.hotkeySettingsPopup).not.toBeVisible();
    await meetingRoomPage.pressEscape();

    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('m');
    expect(await meetingRoomPage.isAudioOn()).toBeFalsy();

    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('v');
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();

    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await meetingRoomPage.useKeyboardShortcut('f');
    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();

    await talkingStickPage.startTalkingStick();
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();
    await meetingRoomPage.useKeyboardShortcut('n');
    await expect(talkingStickPage.yourTurnPopup).toBeVisible();

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
    }
  });
});
