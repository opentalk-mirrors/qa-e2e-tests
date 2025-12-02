// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { VotingRoomPage } from '../../pages/MeetingRoom/ModeratorTools/VotingRoomPage';
import { CustomWorld } from '../cucumberWorld';

let votingRoomPage: VotingRoomPage;

When('{string} opens the Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.startVotingRoomsModeratorTool();
});

Then(
  'the following description should be displayed in the Voting moderator tool for {string}:',
  async function (this: CustomWorld, user: string, description: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.votingRoomMessage).toHaveText(description);
  }
);

When(
  '{string} starts to create a new vote in the Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.createNewVotingRoom();
  }
);

Then(
  'the duration selection field with {string} as default should be displayed in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, duration: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    const votingDurationButton = votingRoomPage.createNewVoting.votingDurationButton;
    await expect(votingDurationButton).toBeVisible();
    await expect(votingDurationButton).toHaveText(duration);
  }
);

Then(
  '{string} should be switched {string} in the Create Voting moderator tool for {string}',
  async function (
    this: CustomWorld,
    button: 'allow abstaining toggle' | 'auto close toggle',
    status: 'ON' | 'OFF',
    user: string
  ) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    if (button === 'allow abstaining toggle' && status === 'ON') {
      await expect(votingRoomPage.createNewVoting.allowAbstainingToggleButton).toBeChecked();
    } else if (button === 'auto close toggle' && status === 'OFF') {
      await expect(votingRoomPage.createNewVoting.autoCloseToggleButton).not.toBeChecked();
    } else if (button === 'auto close toggle' && status === 'ON') {
      await expect(votingRoomPage.createNewVoting.autoCloseToggleButton).toBeChecked();
    } else if (button === 'allow abstaining toggle' && status === 'OFF') {
      await expect(votingRoomPage.createNewVoting.allowAbstainingToggleButton).not.toBeChecked();
    }
  }
);

When(
  '{string} hovers the "auto close toggle" in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.hoverAutoCloseToggleButton();
  }
);

Then(
  'the tooltip for the "auto close" switch on the Create Voting moderator tool for {string} should be:',
  async function (this: CustomWorld, user: string, tooltipDescription: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.createNewVoting.autoCloseToggleButtonTooltipDescription).toHaveText(tooltipDescription);
  }
);

Then(
  '{string} should be selected as voting type in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, votingType: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.createNewVoting.votingTypeDropdownInput).toHaveText(votingType);
  }
);

Then(
  'the heading in the session duration dialog should be {string} in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, title: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    const sessionDurationTitle = votingRoomPage.sessionDurationDialog.sessionDurationTitle;
    await expect(sessionDurationTitle).toBeVisible();
    await expect(sessionDurationTitle).toHaveText(title);
  }
);

When(
  '{string} selects {string} duration in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.selectVotingSessionDuration(duration);
  }
);

Then(
  '{string} saves the selected duration in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.saveSessionDuration();
  }
);

Then(
  /the duration field in the Create Voting moderator tool for "([^"]+)" should be set to "([^"]+)"/,
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.createNewVoting.votingDurationButton).toHaveText(duration);
  }
);

Then(
  'the {string} duration should be selected in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, duration: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    const result: boolean = await votingRoomPage.isDurationSelected(duration);
    expect(result).toBe(true);
  }
);

Then(
  'the session duration dialog should not be displayed in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.sessionDurationDialog.dialogContainer).not.toBeVisible();
  }
);

When(
  '{string} opens the session duration dialog in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.openSessionDurationDialog();
  }
);

Then(
  'the input box {string} with default value {string} should be displayed in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, text: string, defaultValue: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.sessionDurationDialog.customDurationLabel).toHaveText(text);
    await expect(votingRoomPage.sessionDurationDialog.customDurationButtonInput).toBeVisible();
    const checkAtrributeResult = await votingRoomPage.checkCustomDurationInputValue(defaultValue);
    expect(checkAtrributeResult).toBe(true);
  }
);

When(
  '{string} sets {string} as the custom duration in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string, duration: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);

    const customDurationButtonInput = votingRoomPage.sessionDurationDialog.customDurationButtonInput;
    await votingRoomPage.fillLocatorInputValue(customDurationButtonInput, duration);
  }
);

When(
  /"([^"]*)" (decrements|increments) the custom duration (\d+) times in the Create Voting moderator tool/,
  async function (this: CustomWorld, user: string, method: 'increments' | 'decrements', times: number) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);

    if (method === 'decrements') {
      for (let i = 0; i < times; i++) {
        await votingRoomPage.decrementCustomDuration();
      }
    } else {
      for (let i = 0; i < times; i++) {
        await votingRoomPage.incrementCustomDuration();
      }
    }
  }
);

When(
  '{string} closes the session duration dialog in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.closeSessionDurationDialog();
  }
);

When('{string} exits the Create Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
  await votingRoomPage.exitVotingRoomCreation();
});

When(
  '{string} opens the voting type dropdown in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await votingRoomPage.openVotingTypeDropdown();
  }
);

Then(
  'the voting type dropdown should not be displayed in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage(meeting.meetingRoomPage.page);
    await expect(votingRoomPage.createNewVoting.votingTypeDropdown).not.toBeVisible();
  }
);
