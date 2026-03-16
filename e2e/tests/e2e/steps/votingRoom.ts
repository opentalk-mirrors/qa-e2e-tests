// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When, Then, DataTable } from '@cucumber/cucumber';
import { Locator } from '@playwright/test';

import { assert } from '../../helper/assertion';
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
    await assert(
      votingRoomPage.votingRoomMessage,
      'toHaveText',
      description,
      `Expected the voting room message to display "${description}"`
    );
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
    button: 'allow abstaining toggle' | 'auto close toggle' | 'pseudonymous toggle' | 'live toggle',
    status: 'ON' | 'OFF',
    user: string
  ) {
    const meeting = this.getStartedMeeting(user).meeting;
    votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });

    const toggleMap: Record<string, Locator> = {
      'allow abstaining toggle': votingRoomPage.createNewVoting.allowAbstainingToggleButton,
      'auto close toggle': votingRoomPage.createNewVoting.autoCloseToggleButton,
      'pseudonymous toggle': votingRoomPage.createNewVoting.pseudonymousToggleButton,
      'live toggle': votingRoomPage.createNewVoting.liveToggleButton,
    };

    const toggle = toggleMap[button];

    if (!toggle) {
      throw new Error(`Unknown toggle: ${button}`);
    }

    if (status === 'ON') {
      await assert(toggle, 'toBeChecked', undefined, `${button} should be ON`);
    } else {
      await assert(toggle, 'not toBeChecked', undefined, `${button} should be OFF`);
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
    await assert(
      votingRoomPage.createNewVoting.autoCloseToggleButtonTooltipDescription,
      'toHaveText',
      tooltipDescription,
      `Expected the auto-close toggle tooltip to display "${tooltipDescription}"`
    );
  }
);

When('{string} exits the Create Voting moderator tool', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  votingRoomPage = new VotingRoomPage({ page: meeting.meetingRoomPage.page });
  await votingRoomPage.exitVotingRoomCreation();
});

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

    await assert(
      actual.length,
      'toBe',
      expected.length,
      `Expected the number of voting items to be ${expected.length}, but got ${actual.length}`
    );

    for (let i = 0; i < expected.length; i++) {
      await assert(
        actual[i].title,
        'toBe',
        expected[i].title,
        `Expected voting title at index ${i} to be "${expected[i].title}", but got "${actual[i].title}"`
      );
      await assert(
        actual[i].topic,
        'toBe',
        expected[i].topic,
        `Expected voting topic at index ${i} to be "${expected[i].topic}", but got "${actual[i].topic}"`
      );
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

    await assert(
      await votingRoomPage.isSavedVotingListVisible(),
      'toBe',
      false,
      'Expected the saved voting list to be hidden'
    );
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
    await assert(actual, 'toEqual', expected, 'Expected the actual voting list to match the expected voting list');
  }
);

Then(
  'these voting details for {string} should be displayed in the following order in the open moderator tool:',
  async function (this: CustomWorld, user: string, detailsTabel: DataTable) {
    const expectedHeaders = ['title', 'topic'];
    validateDataTableHeaders(detailsTabel, expectedHeaders);
    const expected = detailsTabel.hashes();

    const meeting = this.getStartedMeeting(user).meeting;
    const moderatorToolPage = new ModeratorToolsPage({ page: meeting.meetingRoomPage.page });

    const actual = await moderatorToolPage.getSavedDetails();

    for (let i = 0; i < expected.length; i++) {
      const [title, topic] = actual[i];
      const rowNumber = i + 1;
      await assert(
        title,
        'toBe',
        expected[i].title,
        `Voting row ${rowNumber}: title mismatch. Expected "${expected[i].title}", but found "${title}".`
      );
      await assert(
        topic,
        'toBe',
        expected[i].topic,
        `Voting row ${rowNumber}: topic mismatch. Expected "${expected[i].topic}", but found "${topic}".`
      );
    }
  }
);
