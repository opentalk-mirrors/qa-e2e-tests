// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CoffeeBreakDialogPage } from '../../pages/MeetingRoom/CoffeeBreakDialogPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { CoffeeBreakPage } from '../../pages/MeetingRoom/ModeratorTools/CoffeeBreakPage';
import { SessionDurationDialog } from '../../pages/MeetingRoom/ModeratorTools/SessionDurationDialog';
import { CustomWorld } from '../cucumberWorld';

let moderatorMeetingRoomPage: MeetingRoomPage;

const meetingTitlePrefix: string = 'Ad-hoc Meeting';

Given(
  '{string} has opened the Coffee break option in the moderator sidebar',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectCoffeeBreakModeratorTool();
  }
);

Given(
  '{string} has set {string} as the session duration in the moderator tool',
  async function (
    this: CustomWorld,
    moderatorName: string,
    duration: '5 min' | '10 min' | '15 min' | '30 min' | 'Custom'
  ) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const coffeeBreakPage = new CoffeeBreakPage(meeting.meetingRoomPage);
    await coffeeBreakPage!.openSessionDurationDialog();
    const sessionDurationDialog = new SessionDurationDialog({ page: meeting.meetingRoomPage.page });
    await sessionDurationDialog.selectDuration(duration);
    await sessionDurationDialog.save();
  }
);

Given('{string} has started a coffee break', async function (this: CustomWorld, moderatorName: string) {
  const meeting = this.getStartedMeeting(moderatorName).meeting;
  moderatorMeetingRoomPage = meeting.meetingRoomPage;
  await moderatorMeetingRoomPage.page.bringToFront();
  const coffeeBreakPage = new CoffeeBreakPage(meeting.meetingRoomPage);
  await coffeeBreakPage!.selectStartCoffeeBreakButton();
});

When(
  '{string} returns to the conference from the coffee break',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const coffeeBreakDialogPage = new CoffeeBreakDialogPage(meeting.meetingRoomPage);
    await coffeeBreakDialogPage.goBackToConference();
  }
);

Then(
  'the Meeting room view should be displayed for {string}',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const coffeeBreakDialogPage = new CoffeeBreakDialogPage(moderatorMeetingRoomPage);
    expect(await coffeeBreakDialogPage.isCoffeeBreakDialogClosed()).toBeTruthy();
    await moderatorMeetingRoomPage.meetingRoomName.isVisible();
    expect(await moderatorMeetingRoomPage.getMeetingRoomName()).toContain(meetingTitlePrefix);
  }
);

Then(
  'the Coffee break popover should be displayed in the meeting room for {string} with heading {string}',
  async function (this: CustomWorld, moderatorName: string, headingName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    expect(await moderatorMeetingRoomPage.isCoffeeBreakPopoverOpen()).toBeTruthy();
    await expect(moderatorMeetingRoomPage.coffeeBreakDialog.coffeeBreakPopover).toContainText(headingName);
  }
);

Then(
  'the Coffee break icon should be visible for {string} inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await expect(moderatorMeetingRoomPage.coffeeBreakDialog.coffeeBreakIcon).toBeVisible();
  }
);

Then(
  'a label named {string} should be displayed for {string} inside the Coffee break popover',
  async function (this: CustomWorld, durationText: string, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const sessionDurationDialog = new SessionDurationDialog({ page: meeting.meetingRoomPage.page });
    await expect(sessionDurationDialog.durationLabel).toHaveText(durationText);
  }
);

Then(
  'for {string} the remaining time should be shown in MM:SS format inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const mmssRegex = /^\d{2}\s*:\s*\d{2}$/;
    await expect(moderatorMeetingRoomPage.coffeeBreakDialog.timerText).toHaveText(mmssRegex);
  }
);

Then(
  'the countdown timer should be running for {string} inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    expect(
      await moderatorMeetingRoomPage.isTimerCountingDown(moderatorMeetingRoomPage.coffeeBreakDialog.timerText)
    ).toBeTruthy();
  }
);

When('{string} stops the coffee break', async function (this: CustomWorld, moderatorName: string) {
  const meeting = this.getStartedMeeting(moderatorName).meeting;
  moderatorMeetingRoomPage = meeting.meetingRoomPage;
  await moderatorMeetingRoomPage.page.bringToFront();
  const coffeeBreakPage = new CoffeeBreakPage(meeting.meetingRoomPage);
  await coffeeBreakPage!.stopCoffeeBreak();
  await moderatorMeetingRoomPage.waitForCoffeeBreakPopoverToClose();
});

Then(
  'the Coffee break popover in the Meeting room should be closed for {string}',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    expect(await moderatorMeetingRoomPage.isCoffeeBreakPopoverClosed()).toBe(true);
  }
);

Then(
  'the Coffee break layer should not be visible for guest {string} in the meeting room of {string}',
  async function (this: CustomWorld, guestName: string, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName);
    const guestMeetingRoomPage = meeting.participantMeetingRoomPages[guestName];
    if (!guestMeetingRoomPage) {
      throw new Error(`${guestName} not found`);
    }
    await guestMeetingRoomPage.page.bringToFront();
    const coffeeBreakDialogPage = new CoffeeBreakDialogPage(guestMeetingRoomPage);
    expect(await coffeeBreakDialogPage.isCoffeeBreakDialogClosed()).toBeTruthy();
    await guestMeetingRoomPage.meetingRoomName.isVisible();
    expect(await guestMeetingRoomPage.getMeetingRoomName()).toContain(meetingTitlePrefix);
  }
);

Then(
  'the timer option should be enabled again in the moderator sidebar tool for {string}',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await expect(moderatorMeetingRoomPage.moderationTools.timerButton).toBeEnabled();
  }
);
