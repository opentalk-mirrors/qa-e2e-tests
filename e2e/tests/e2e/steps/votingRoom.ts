// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { validateDataTableHeaders } from '../../helper/helper';
import { VotingRoomPage } from '../../pages/MeetingRoom/ModeratorTools/VotingRoomPage';
import { ModeratorToolsPage } from '../../pages/MeetingRoom/ModeratorToolsPage';
import { CustomWorld } from '../cucumberWorld';

let votingRoomPage: VotingRoomPage;

When('{string} opens the Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await meeting.meetingRoomPage.page.bringToFront();
  await meeting.meetingRoomPage.startVotingRoomsModeratorTool();
});

Then(
  'the following description should be displayed in the Voting moderator tool for {string}:',
  async function (this: CustomWorld, user: string, description: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await expect(votingRoomPage.votingRoomMessage).toHaveText(description);
  }
);

When(
  '{string} starts to create a new vote in the Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
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
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
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
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await votingRoomPage.hoverAutoCloseToggleButton();
  }
);

Then(
  'the tooltip for the "auto close" switch on the Create Voting moderator tool for {string} should be:',
  async function (this: CustomWorld, user: string, tooltipDescription: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await expect(votingRoomPage.createNewVoting.autoCloseToggleButtonTooltipDescription).toHaveText(tooltipDescription);
  }
);

Then(
  '{string} should be selected as voting type in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, votingType: string, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await expect(votingRoomPage.createNewVoting.votingTypeDropdownInput).toHaveText(votingType);
  }
);

When('{string} exits the Create Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
  await votingRoomPage.exitVotingRoomCreation();
});

When(
  '{string} opens the voting type dropdown in the Create Voting moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await votingRoomPage.openVotingTypeDropdown();
  }
);

Then(
  'the voting type dropdown should not be displayed in the Create Voting moderator tool for {string}',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await expect(votingRoomPage.createNewVoting.votingTypeDropdown).not.toBeVisible();
  }
);

When('{string} saves the voting in the Create Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
  await votingRoomPage.save();
});

When(
  '{string} creates the following Votes in the open moderator tool:',
  async function (this: CustomWorld, user: string, votingsTable: DataTable) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    // Note: DataTable headers are capitalized here because the voting form field labels
    // in the UI are capitalized. In other steps, headers remain lowercase.
    const expectedHeaders = ['Title', 'Subtitle', 'Topic'];
    validateDataTableHeaders(votingsTable, expectedHeaders);
    const votes = votingsTable.hashes();
    const moderatorToolsPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });

    for (const vote of votes) {
      await votingRoomPage.createNewVotingRoom();
      for (const [field, value] of Object.entries(vote)) {
        await moderatorToolsPage.enterFieldValue(field, value);
      }
      await votingRoomPage.save();
      await votingRoomPage.exitVotingRoomCreation();
    }
  }
);

Then(
  'the saved voting list for {string} should be displayed in the following order in the open moderator tool:',
  async function (this: CustomWorld, user: string, displayedVotingsTabel: DataTable) {
    const expectedHeaders = ['title', 'topic'];
    validateDataTableHeaders(displayedVotingsTabel, expectedHeaders);
    const expected = displayedVotingsTabel.hashes();

    const meeting = this.getStartedMeeting(user).meeting;
    const votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    const actual = await votingRoomPage.getSavedVotings();

    expect(actual.length).toBe(expected.length);

    for (let i = 0; i < expected.length; i++) {
      expect(actual[i].title).toBe(expected[i].title);
      expect(actual[i].topic).toBe(expected[i].topic);
    }
  }
);

When(
  '{string} {string} the saved voting section in the open moderator tool',
  async function (this: CustomWorld, user: string, _action: string) {
    if (!['collapses', 'expands'].includes(_action)) {
      throw new Error(`Unsupported action: ${_action}`);
    }

    const meeting = this.getStartedMeeting(user).meeting;
    const votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });

    await votingRoomPage.toggleHideUnhide();
  }
);

Then(
  'the saved voting list should be hidden for {string} in the open moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });

    expect(await votingRoomPage.isSavedVotingListVisible()).toBe(false);
  }
);

When(
  '{string} selects the last voting from the list in the open moderator tool',
  async function (this: CustomWorld, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    await votingRoomPage.clickRecentlySavedVoting();
  }
);

Then(
  'the following saved voting details should be displayed on the Update Voting screen for {string}:',
  async function (this: CustomWorld, user: string, lastCreatedVotingsTabel: DataTable) {
    const expectedHeaders = ['field', 'value'];
    validateDataTableHeaders(lastCreatedVotingsTabel, expectedHeaders);
    const lastCreatedVotingDetails = lastCreatedVotingsTabel.hashes();
    const meeting = this.getStartedMeeting(user).meeting;
    const votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
    const actual = await votingRoomPage.getVotingFormValues();

    const normalizeValue = (value: string) => {
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      return value;
    };

    const expected = Object.fromEntries(
      lastCreatedVotingDetails.map(({ field, value }) => [field, normalizeValue(value)])
    );
    expect(actual).toEqual(expected);
  }
);
