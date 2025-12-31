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
