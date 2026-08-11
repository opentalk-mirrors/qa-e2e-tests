// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Given, Then, When } from '@cucumber/cucumber';

import { assert } from '../../helper/assertion';
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
    await assert(
      await coffeeBreakDialogPage.isCoffeeBreakDialogClosed(),
      'toBeTruthy',
      undefined,
      'Expected the Coffee break overlay to be closed for the guest'
    );
    await moderatorMeetingRoomPage.meetingRoomName.isVisible();
    const meetingName = await moderatorMeetingRoomPage.getMeetingRoomName();
    await assert(
      meetingName,
      'toContain',
      meetingTitlePrefix,
      `Expected the meeting room name to contain "${meetingTitlePrefix}", but got "${meetingName}"`
    );
  }
);

Then(
  'the Coffee break popover should be displayed in the meeting room for {string} with heading {string}',
  async function (this: CustomWorld, moderatorName: string, headingName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const isCoffeeBreakPopoverOpen = await moderatorMeetingRoomPage.isCoffeeBreakPopoverOpen();
    await assert(
      isCoffeeBreakPopoverOpen,
      'toBeTruthy',
      undefined,
      'Expected the Coffee break popover to be visible in the meeting room'
    );
    await assert(
      moderatorMeetingRoomPage.coffeeBreakDialog.coffeeBreakPopover,
      'toContainText',
      headingName,
      `Expected the Coffee break popover heading to contain "${headingName}"`
    );
  }
);

Then(
  'the Coffee break icon should be visible for {string} inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await assert(
      moderatorMeetingRoomPage.coffeeBreakDialog.coffeeBreakIcon,
      'toBeVisible',
      undefined,
      `Expected coffee break icon to be visible`
    );
  }
);

Then(
  'a label named {string} should be displayed for {string} inside the Coffee break popover',
  async function (this: CustomWorld, durationText: string, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const sessionDurationDialog = new SessionDurationDialog({ page: meeting.meetingRoomPage.page });
    await assert(
      sessionDurationDialog.durationLabel,
      'toHaveText',
      durationText,
      `Expected the session duration label to display "${durationText}"`
    );
  }
);

Then(
  'for {string} the remaining time should be shown in MM:SS format inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    const mmssRegex = /^\d{2}\s*:\s*\d{2}$/;
    await assert(
      moderatorMeetingRoomPage.coffeeBreakDialog.timerText,
      'toHaveText',
      mmssRegex,
      'Expected the remaining time to be displayed in MM:SS format'
    );
  }
);

Then(
  'the countdown timer should be running for {string} inside the Coffee break popover',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await assert(
      await moderatorMeetingRoomPage.isTimerCountingDown(moderatorMeetingRoomPage.coffeeBreakDialog.timerText),
      'toBeTruthy',
      undefined,
      'Expected the Coffee break countdown timer to be running'
    );
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
    await assert(
      await moderatorMeetingRoomPage.isCoffeeBreakPopoverClosed(),
      'toBeTruthy',
      'Expected the Coffee break popover to be closed'
    );
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
    await assert(
      await coffeeBreakDialogPage.isCoffeeBreakDialogClosed(),
      'toBeTruthy',
      undefined,
      'Expected the Coffee break dialog to be closed after returning to the conference'
    );
    await guestMeetingRoomPage.meetingRoomName.isVisible();
    const meetingName = await guestMeetingRoomPage.getMeetingRoomName();
    await assert(
      meetingName,
      'toContain',
      meetingTitlePrefix,
      `Expected the meeting room name to contain "${meetingTitlePrefix}", but got "${meetingName}"`
    );
  }
);

Then(
  'the timer option should be enabled again in the moderator sidebar tool for {string}',
  async function (this: CustomWorld, moderatorName: string) {
    const meeting = this.getStartedMeeting(moderatorName).meeting;
    moderatorMeetingRoomPage = meeting.meetingRoomPage;
    await moderatorMeetingRoomPage.page.bringToFront();
    await assert(
      moderatorMeetingRoomPage.moderationTools.timerButton,
      'toBeEnabled',
      undefined,
      'Expected the Timer moderation tool to be enabled after the Coffee break ended'
    );
  }
);
