// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { globalSetup } from '../../../authHelpers';
import { deleteUser } from '../../../helper/keycloak';
import { startAdhocMeetingAsModerator } from '../../../helper/meetingHelpers';
import { joinMeetingRoomAsGuest } from '../../../helper/playwrightMeetingHelpers';
import { closeWebkitPopUp } from '../../../helper/webkit';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { TimerPage } from '../../../pages/MeetingRoom/ModeratorTools/TimerPage';

const timerTitle = 'MyTimer';
const NUMBER_OF_GUESTS = 1;

test.describe('Meeting Room_Timer', () => {
  let userId = '';
  let meetingRoomPage: MeetingRoomPage,
    guestLink: string,
    guestMeetingRoomPage: MeetingRoomPage,
    meetingParticipantPages: TimerPage[],
    timerPage: TimerPage;

  test.afterEach(async () => {
    await deleteUser(userId);
  });

  test.beforeEach(async ({ page, browser, browserName, context }, testInfo) => {
    userId = await globalSetup(page, context, testInfo);
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(browser, guestLink, 'guest1');
    guestMeetingRoomPage = participantMeetingRoomPages['guest1'];
    const meetingRoomTimerPage: TimerPage = new TimerPage({ page: meetingRoomPage.page });
    const guestMeetingRoomTimerPage: TimerPage = new TimerPage({ page: guestMeetingRoomPage.page });
    meetingParticipantPages = [meetingRoomTimerPage, guestMeetingRoomTimerPage]; // need to add invitedGuest in future
    await meetingRoomPage.page.bringToFront();
    timerPage = await meetingRoomPage.startTimerModeratorTool();
  });

  test('TC_001_Meeting Room_As Moderator_Timer', async () => {
    await meetingRoomPage.page.bringToFront();
    const timerPage: TimerPage = await meetingRoomPage.startTimerModeratorTool();
    expect(await timerPage.getHeadingText()).toBe('Timer');
    await expect(timerPage.durationButton).toHaveAccessibleName('Duration 1 minute');
    await expect(timerPage.titleTextbox).toBeVisible();
    await expect(timerPage.participantsReadyCheckbox).toBeChecked();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
  });

  test('TC_002_Meeting Room_As Moderator_Timer_Duration_Session Duration', async () => {
    let sessionDurationDialog = await timerPage.openSessionDurationDialog();
    await expect(sessionDurationDialog.title).toHaveText('Session Duration');
    await expect(sessionDurationDialog.unlimitedTimeDurationButton).toBeVisible();
    await expect(sessionDurationDialog.oneMinuteDurationButton).toBeVisible();
    await expect(sessionDurationDialog.twoMinuteDurationButton).toBeVisible();
    await expect(sessionDurationDialog.fiveMinuteDurationButton).toBeVisible();
    await expect(sessionDurationDialog.customDurationButton).toBeVisible();
    await expect(sessionDurationDialog.closeButton).toBeVisible();
    await expect(sessionDurationDialog.saveButton).toBeVisible();

    const durations = [
      { duration: 'Unlimited Time', accessibleName: 'Duration Unlimited Time' },
      { duration: '1 min', accessibleName: 'Duration 1 minute' },
      { duration: '2 min', accessibleName: 'Duration 2 minutes' },
      { duration: '5 min', accessibleName: 'Duration 5 minutes' },
    ] as const;
    for (const duration of durations) {
      await sessionDurationDialog.selectDuration(duration.duration);
      expect(await sessionDurationDialog.getSelectedDurationText()).toBe(duration.duration);

      await sessionDurationDialog.save();
      expect(await timerPage.isSessionDurationDialogVisible()).toBeFalsy();
      await expect(timerPage.durationButton).toHaveAccessibleName(duration.accessibleName);

      sessionDurationDialog = await timerPage.openSessionDurationDialog();
      await expect(sessionDurationDialog.dialogContainer).toBeVisible();
    }

    await sessionDurationDialog.selectDuration('Custom');
    expect(await sessionDurationDialog.getSelectedDurationText()).toBe('Custom');
    await expect(sessionDurationDialog.customDurationButtonInput).toBeVisible();
    await expect(sessionDurationDialog.customDurationButtonInput).toHaveValue('1');

    await sessionDurationDialog.activateCustomDurationInput();
    await expect(sessionDurationDialog.customDurationButtonInput).toBeFocused();

    await sessionDurationDialog.setCustomDuration('3');
    await sessionDurationDialog.save();
    await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
    await expect(timerPage.durationButton).toHaveAccessibleName('Duration 3 minutes');

    sessionDurationDialog = await timerPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration('Unlimited Time');
    await sessionDurationDialog.close();
    await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
    await expect(timerPage.durationButton).not.toHaveAccessibleName('Duration Unlimited Time');
  });

  test.describe('TC_003_Meeting Room_As Moderator_Timer_Create Timer_with different duration, with Title', () => {
    test('Create Timer (With Unlimited Time)', async () => {
      const sessionDurationDialog = await timerPage.openSessionDurationDialog();
      await sessionDurationDialog.selectDuration('Unlimited Time');
      await sessionDurationDialog.save();
      await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
      await expect(timerPage.durationButton).toHaveAccessibleName('Duration Unlimited Time');

      await timerPage.selectTimerTitleInput();
      expect(await timerPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.elapsedTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeTruthy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.elapsedTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeTruthy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.stopTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerStoppedAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration 1min/2min/5min)', async () => {
      const sessionDurationDialog = await timerPage.openSessionDurationDialog();
      await sessionDurationDialog.selectDuration('1 min');
      await sessionDurationDialog.save();
      await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
      await expect(timerPage.durationButton).toHaveAccessibleName('Duration 1 minute');

      await timerPage.selectTimerTitleInput();
      expect(await timerPage.getPlaceholderOfTimerTitleInput()).toBe('New timer');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerRanOutAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });

    test('Create Timer (With Duration Custom)', async () => {
      const sessionDurationDialog = await timerPage.openSessionDurationDialog();
      await sessionDurationDialog.selectDuration('Custom');
      await sessionDurationDialog.setCustomDuration('1');
      await sessionDurationDialog.save();
      await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
      await expect(timerPage.durationButton).toHaveAccessibleName('Duration 1 minute');

      await timerPage.enterTimerTitle(timerTitle);
      expect(await timerPage.getTimerTitleInputValue()).toBe(timerTitle);

      await timerPage.toggleAskParticipantsIfReady(true);
      await expect(timerPage.participantsReadyCheckbox).toBeChecked();

      await timerPage.createNewTimer();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
        await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
        await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
        await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
        expect(await page.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeFalsy();
        await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
      await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
      await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
      expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
      await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
      expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
      await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

      await timerPage.waitForRemainingTimerTime();
      for (const page of meetingParticipantPages) {
        await page.page.bringToFront();
        await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
        await expect(page.createTimer.timerRanOutAlert).toBeVisible();
      }

      await timerPage.page.bringToFront();
      await expect(timerPage.createTimer.createTimerButton).toBeVisible();
      await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
    });
  });

  test('TC_004_Meeting Room_As Moderator_Timer_Create Timer_without Title', async () => {
    const sessionDurationDialog = await timerPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration('1 min');
    await sessionDurationDialog.save();
    await expect(sessionDurationDialog.dialogContainer).not.toBeVisible();
    await expect(timerPage.durationButton).toHaveAccessibleName('Duration 1 minute');

    expect(await timerPage.getTimerTitleInputValue()).toBe('');

    await timerPage.toggleAskParticipantsIfReady(true);
    await expect(timerPage.participantsReadyCheckbox).toBeChecked();

    await timerPage.createNewTimer();
    await expect(timerPage.getTimerStartedPopup()).toBeVisible();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
      await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
      await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
      expect(await page.isCountingUp(page.createTimer.timerStartedPopup.time)).toBeFalsy();
      await expect(page.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
    await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
    await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
    expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
    await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
    expect(await timerPage.getParticipantsNotDoneStatus()).toHaveLength(NUMBER_OF_GUESTS);
    await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    await timerPage.waitForRemainingTimerTime();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.getTimerStartedPopup()).not.toBeVisible();
      await expect(page.createTimer.timerRanOutAlert).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
  });

  test('TC_005_Meeting Room_As Moderator_Timer_Create Timer_With “Ask participants if they are ready” toggle button as ON/OFF', async () => {
    const sessionDurationDialog = await timerPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration('1 min');
    await sessionDurationDialog.save();
    await timerPage.enterTimerTitle(timerTitle);

    await timerPage.toggleAskParticipantsIfReady(false);
    await expect(timerPage.participantsReadyCheckbox).not.toBeChecked();

    await timerPage.createNewTimer();
    await expect(timerPage.getTimerStartedPopup(timerTitle)).toBeVisible();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.createTimer.timerStartedPopup.timerStartedHeading).toHaveText('A timer was started');
      await expect(page.getTimerTitle(timerTitle)).toHaveText(timerTitle);
      await expect(page.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
      await expect(page.createTimer.timerStartedPopup.time).toBeVisible();
      expect(await page.isCountingUp(page.createTimer.timerStartedPopup.time)).toBeFalsy();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.tabPanel.heading).toHaveText('Timer');
    await expect(timerPage.createTimer.tabPanel.remainingTimeLabel).toBeVisible();
    await expect(timerPage.createTimer.tabPanel.time).toBeVisible();
    expect(await timerPage.isCountingUp(timerPage.createTimer.tabPanel.time)).toBeFalsy();
    await expect(timerPage.createTimer.tabPanel.participantsHeading).toBeVisible();
    await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    await timerPage.waitForRemainingTimerTime();
    for (const page of meetingParticipantPages) {
      await page.page.bringToFront();
      await expect(page.getTimerStartedPopup(timerTitle)).not.toBeVisible();
      await expect(page.createTimer.timerRanOutAlert).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
  });

  test.skip('TC_006_Meeting Room_As Moderator_Timer_Mark me as done button+Stop Timer button', async ({ browser }) => {
    const sessionDurationDialog = await timerPage.openSessionDurationDialog();
    await sessionDurationDialog.selectDuration('1 min');
    await sessionDurationDialog.save();
    await timerPage.enterTimerTitle(timerTitle);

    await timerPage.toggleAskParticipantsIfReady(true);
    await expect(timerPage.participantsReadyCheckbox).toBeChecked();

    await timerPage.createNewTimer();
    for (const meetingParticipantPage of meetingParticipantPages) {
      await meetingParticipantPage.page.bringToFront();
      await expect(meetingParticipantPage.getTimerStartedPopup(timerTitle)).toBeVisible();
      await expect(meetingParticipantPage.createTimer.timerStartedPopup.timerStartedHeading).toHaveText(
        'A timer was started'
      );
      await expect(meetingParticipantPage.getTimerTitle(timerTitle)).toHaveText(timerTitle);
      await expect(meetingParticipantPage.createTimer.timerStartedPopup.remainingTimeLabel).toBeVisible();
      await expect(meetingParticipantPage.createTimer.timerStartedPopup.time).toBeVisible();
      expect(await meetingParticipantPage.isCountingUp(timerPage.createTimer.timerStartedPopup.time)).toBeFalsy();
      await expect(meetingParticipantPage.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
    }

    await timerPage.page.bringToFront();
    const timerPageTabPanel = timerPage.createTimer.tabPanel;
    await expect(timerPageTabPanel.heading).toHaveText('Timer');
    await expect(timerPageTabPanel.remainingTimeLabel).toBeVisible();
    await expect(timerPageTabPanel.time).toBeVisible();
    expect(await timerPage.isCountingUp(timerPageTabPanel.time)).toBeFalsy();
    await expect(timerPageTabPanel.participantsHeading).toBeVisible();
    expect(await timerPage.getParticipantsNotDoneStatus()).toEqual(['guest1']);
    await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    for (const meetingParticipantPage of meetingParticipantPages) {
      await meetingParticipantPage.page.bringToFront();
      let i = 1;
      do {
        await meetingParticipantPage.markMeAsDone();
        await expect(meetingParticipantPage.createTimer.timerStartedPopup.markMeAsDoneButton).not.toBeVisible();
        await expect(meetingParticipantPage.createTimer.timerStartedPopup.unmarkMeAsDoneButton).toBeVisible();

        await meetingParticipantPage.unmarkMeAsDone();
        await expect(meetingParticipantPage.createTimer.timerStartedPopup.markMeAsDoneButton).toBeVisible();
        await expect(meetingParticipantPage.createTimer.timerStartedPopup.unmarkMeAsDoneButton).not.toBeVisible();
        i++;
      } while (i <= 3);
    }

    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(browser, guestLink, 'guest2');
    const secondGuestMeetingRoomPage = participantMeetingRoomPages['guest2'];
    const secondGuestMeetingRoomTimerPage = new TimerPage({ page: secondGuestMeetingRoomPage.page });
    await secondGuestMeetingRoomTimerPage.markMeAsDone();

    await timerPage.page.bringToFront();
    await expect(timerPageTabPanel.heading).toHaveText('Timer');
    await expect(timerPageTabPanel.remainingTimeLabel).toBeVisible();
    await expect(timerPageTabPanel.time).toBeVisible();
    expect(await timerPage.isCountingUp(timerPageTabPanel.time)).toBeFalsy();
    await expect(timerPageTabPanel.participantsHeading).toBeVisible();
    expect(await timerPage.getParticipantsNotDoneStatus()).toEqual(['guest1']);
    expect(await timerPage.getParticipantsDoneStatus()).toEqual(['guest2']);
    await expect(timerPage.createTimer.stopTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeDisabled();

    await timerPage.stopTimer();
    for (const meetingParticipantPage of meetingParticipantPages) {
      await meetingParticipantPage.page.bringToFront();
      await expect(meetingParticipantPage.getTimerStartedPopup(timerTitle)).not.toBeVisible();
      await expect(meetingParticipantPage.createTimer.timerStoppedAlert).toBeVisible();
    }

    await timerPage.page.bringToFront();
    await expect(timerPage.createTimer.createTimerButton).toBeVisible();
    await expect(meetingRoomPage.moderationTools.coffeeBreakButton).toBeEnabled();
  });
});
