// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { Page } from '@playwright/test';

import { getMeetingLink, OpenTalkEvent } from '../../helper/Api';
import { assert } from '../../helper/assertion';
import { getClipboardContent, setClipboardContent } from '../../helper/clipboardHelpers';
import { joinMeetingRoomWithNGuests, joinMeetingRoomAsGuest } from '../../helper/gherkinMeetingHelpers';
import { substituteInLineCodes, validateDataTableHeaders } from '../../helper/helper';
import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { MyMeetingsPage } from '../../pages/MyMeetingsPage';
import { CustomWorld, User } from '../cucumberWorld';

Given(
  '{string} has started an ad-hoc meeting and joined the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    await startAdhocMeeting(this, username);
  }
);
When(
  '{string} starts an ad-hoc meeting and joins the meeting as moderator',
  async function (this: CustomWorld, username: string) {
    await startAdhocMeeting(this, username);
  }
);

When(
  /^"([^"]*)" joins the meeting of "([^"]*)" as guest$/,
  async function (this: CustomWorld, guest: string, username: string) {
    const meeting = this.getStartedMeeting(username).meeting;
    await joinMeetingRoomAsGuest(this, username, meeting.meetingLink, guest);
  }
);

When(
  '{int} guests join the meeting of {string}',
  async function (this: CustomWorld, numOfGuests: number, username: string) {
    const meeting = this.getStartedMeeting(username).meeting;
    await joinMeetingRoomWithNGuests(this, username, meeting.meetingLink, 'guest', numOfGuests);
  }
);

Given(
  /^(\d+) guests? ha(?:s|ve) joined the meeting of "(.+)"$/,
  async function (this: CustomWorld, numOfGuests: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await joinMeetingRoomWithNGuests(this, user, meeting.meetingLink, 'guest', numOfGuests);
  }
);

Given(
  '{int} guests have joined the meeting of {string} with delay of {int} milliseconds',
  async function (this: CustomWorld, numOfGuests: number, user: string, delay: number) {
    const meeting = this.getStartedMeeting(user).meeting;
    await joinMeetingRoomWithNGuests(this, user, meeting.meetingLink, 'guest', numOfGuests, { audio: false }, delay);
  }
);

When(
  '{string} closes all open dialogs by pressing Escape {int} times',
  async function (this: CustomWorld, user: string, countPressing: number) {
    const meetingRoomPage = this.getStartedMeeting(user).meeting.meetingRoomPage;
    await meetingRoomPage.page.bringToFront();
    for (let i = 0; i < countPressing; i++) {
      await meetingRoomPage.pressEscape();
      await waitForDomStopChanging(meetingRoomPage.page);
    }
  }
);

When('{string} copies the meeting link into the clipboard', async function (this: CustomWorld, user: string) {
  const meeting = this.getStartedMeeting(user).meeting;
  await setClipboardContent(meeting.meetingRoomPage.page, meeting.meetingLink);
});

When(
  'a guest joins the meeting using the link in the clipboard of {string}',
  async function (this: CustomWorld, user: string) {
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    await joinMeetingRoomAsGuest(this, user, clipboardContent, 'guest_joined_inside_breakout_room');
  }
);

Then(
  /^(\d+) participants? should be in the (?:meeting|breakout) room of "([^"]*)"$/,
  async function (this: CustomWorld, expectedNumOfParticipants: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectModeratorToolHome();
    const actualNumOfParticipants = await meeting.meetingRoomPage.getNumberOfParticipantsInMeeting();
    await assert(
      actualNumOfParticipants,
      'toBe',
      expectedNumOfParticipants,
      `Expected to have ${expectedNumOfParticipants} participants but found ${actualNumOfParticipants} participants`
    );
  }
);

Then(
  'the content of the clipboard of {string} should match {string}',
  async function (this: CustomWorld, user: string, regexToMatch: string) {
    const urlRegex = substituteInLineCodes(regexToMatch);
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    await assert(
      clipboardContent,
      'toMatch',
      urlRegex,
      `Expected clipboard content to match '${urlRegex}' but got '${clipboardContent}'`
    );
  }
);

async function startAdhocMeeting(world: CustomWorld, username: string) {
  const user = world.getUser(username);
  const meeting = await startAdhocMeetingAsModerator(user);
  world.setStartedMeeting(username, meeting);
  world.addParticipantMeetingRooms(username, {
    [username]: world.getStartedMeeting(username).meeting.meetingRoomPage,
  });
}

async function startAdhocMeetingAsModerator(
  user: User,
  browserName?: 'webkit' | 'chromium' | 'firefox',
  meetingTitlePrefix: string = 'Ad-hoc Meeting'
) {
  const page = user.page;
  const { meetingLink, meetingId } = await user.api.startAdhocMeetingAsModerator(meetingTitlePrefix, 'direct_access');
  await page.goto(meetingLink);
  const lobbyRoomPage = new LobbyRoomPage({ page });
  await lobbyRoomPage.renderLobbyPage();
  // Close warning button in safari
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }

  // enter meeting room & assert meeting room is shown
  const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();

  await meetingRoomPage.meetingRoomName.waitFor({ state: 'visible' });
  await assert(
    await meetingRoomPage.getMeetingRoomName(),
    'toContain',
    meetingTitlePrefix,
    `Expected meeting room name to contain "${meetingTitlePrefix}"`
  );

  // only moderator is present before guests join
  await assert(
    await meetingRoomPage.getNumberOfParticipantsInMeeting(),
    'toBe',
    1,
    'Expected only the moderator to be present before guests join'
  );
  return { meetingRoomPage, meetingLink, meetingId };
}

Given(
  /^"([^"]+)" has created an? (scheduled|unscheduled) meeting with the title "([^"]+)"$/,
  async function (this: CustomWorld, moderator: string, meetingType: string, meetingTitle: string) {
    const user = this.getUser(moderator).api;
    await user.planMeetingAsModerator({
      title: meetingTitle,
      is_time_independent: meetingType === 'unscheduled',
    });
  }
);

async function joinMeeting(
  world: CustomWorld,
  userToJoin: User,
  meeting: OpenTalkEvent,
  options?: { value?: string }
): Promise<MeetingRoomPage> {
  await userToJoin.page.goto(userToJoin.api.getMeetingLink(meeting.room.id));
  const lobbyRoomPage = new LobbyRoomPage({ page: userToJoin.page });
  await lobbyRoomPage.renderLobbyPage();

  // Close the warning button in safari
  if (world.browser.browserType().name() === 'webkit') {
    await closeWebkitPopUp({ page: userToJoin.page });
  }

  if (options?.value === 'enabled') {
    await lobbyRoomPage.waitForMicrophoneButtonToBeEnabled();
    await lobbyRoomPage.turnOnMicrophone();
  }

  // enter the meeting room & assert meeting room is shown
  return await lobbyRoomPage.enterMeetingRoom();
}

Given(
  '{string} has joined the meeting with the title {string} as moderator',
  async function (this: CustomWorld, moderator: string, meetingTitle: string) {
    const user = this.getUser(moderator);
    const meeting = await user.api.getMeetingByTitle(meetingTitle);
    const meetingRoomPage = await joinMeeting(this, user, meeting);
    this.setStartedMeeting(moderator, {
      meetingId: meeting.id,
      meetingRoomPage: meetingRoomPage,
      meetingLink: user.api.getMeetingLink(meeting.room.id),
    });
  }
);

Given(
  '{string} has joined the meeting with the title {string} created by {string} with:',
  async function (
    this: CustomWorld,
    nameOfUserToJoin: string,
    meetingTitle: string,
    nameOfModerator: string,
    optionsTable: DataTable
  ) {
    const expectedHeaders = ['setting', 'value'];
    validateDataTableHeaders(optionsTable, expectedHeaders);
    const options = optionsTable.hashes()[0];
    const moderator = this.getUser(nameOfModerator);
    const userToJoin = this.getUser(nameOfUserToJoin);
    const meeting = await moderator.api.getMeetingByTitle(meetingTitle);
    this.addParticipantMeetingRooms(nameOfModerator, {
      [nameOfUserToJoin]: await joinMeeting(this, userToJoin, meeting, options),
    });
  }
);

Given(
  '{string} has invited {string} to meeting {string}',
  async function (this: CustomWorld, moderator: string, invitedUser: string, meetingTitle: string) {
    const api = this.getUser(moderator).api;
    const meeting = await api.getMeetingByTitle(meetingTitle);
    const user = await api.getUser(invitedUser.toLowerCase() + this.testId);
    await api.inviteUser(meeting.id, user[0].email);
  }
);

When(
  '{string} checks more options for meeting {string} on the Home-Page',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await home.showMoreOptions(meetingTitle);
  }
);

Then(
  'the following options should be displayed on the Home-Page for {string}:',
  async function (this: CustomWorld, user: string, expectedDetailsDataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const expectedDetails = expectedDetailsDataTable.raw().map(([value]) => value);
    for (const option of expectedDetails) {
      switch (option) {
        case 'Edit':
          await assert(
            home.editMenuItem,
            'toBeVisible',
            'Expected the "Edit" option to be visible in the 3-dot menu for the meeting on the Home-Page'
          );
          break;
        case 'Add to favorites':
          await assert(
            home.addToFavoriteMenuItem,
            'toBeVisible',
            'Expected the "Add to favorites" option to be visible in the 3-dot menu on the Home-Page'
          );
          break;
        case 'Copy Meeting-Link':
          await assert(
            home.copyMeetingLinkMenuItem,
            'toBeVisible',
            'Expected the "Copy Meeting-Link" option to be visible in the 3-dot menu on the Home-Page'
          );
          break;
        case 'Delete':
          await assert(
            home.deleteMenuItem,
            'toBeVisible',
            'Expected the "Delete" option to be visible in the 3-dot menu on the Home-Page'
          );
          break;
        case 'Details':
          await assert(
            home.detailsMenuItem,
            'toBeVisible',
            'Expected the "Details" option to be visible in the 3-dot menu on the Home-Page'
          );
          break;
        case 'Decline':
          await assert(
            home.declineMenuItem,
            'toBeVisible',
            'Expected the "Decline" option to be visible in the 3-dot menu on the Home-Page'
          );
          break;
        default:
          throw new Error(`'${option}' option is not available in 3-dot button menu`);
      }
    }
    await page.keyboard.press('Escape');
  }
);

When('{string} navigates to the Home-Page', async function (this: CustomWorld, moderator: string) {
  await navigateToHomePage(this, moderator);
});

async function navigateToHomePage(world: CustomWorld, moderator: string) {
  const page = world.getUser(moderator).page;
  const home = new HomePage({ page: page });
  await home.navigateToHomePage();
  return home;
}

Given(
  '{string} has accepted the invitation for the meeting with the title {string} created by {string}',
  async function (this: CustomWorld, invitee: string, meetingTitle: string, moderator: string) {
    const api = this.getUser(moderator).api;
    const apiInvitee = this.getUser(invitee).api;
    const meeting = await api.getMeetingByTitle(meetingTitle);
    await assert(
      meeting.created_by.firstname,
      'toBe',
      moderator,
      `Expected meeting "${meetingTitle}" to be created by "${moderator}", but it was created by "${meeting.created_by.firstname}"`
    );
    await apiInvitee.acceptInvite(meeting.id);
  }
);

Given(
  '{int} guests have joined the meeting with the title {string} created by {string} with:',
  async function (
    this: CustomWorld,
    numOfGuests: number,
    meetingTitle: string,
    moderator: string,
    optionsTable: DataTable
  ) {
    const expectedHeaders = ['setting', 'value'];
    validateDataTableHeaders(optionsTable, expectedHeaders);
    const options = optionsTable.hashes()[0];

    const api = this.getUser(moderator).api;
    const meeting = await api.getMeetingByTitle(meetingTitle);
    const meetingLink = api.getMeetingLink(meeting.room.id);
    await joinMeetingRoomWithNGuests(this, moderator, meetingLink, 'guest', numOfGuests, {
      audio: options.value === 'enabled',
    });
  }
);

Then(
  'the following details should be displayed for meeting {string} on the Home-Page for {string}:',
  async function (this: CustomWorld, meetingTitle: string, user: string, dataTable: DataTable) {
    const userObj = this.getUser(user);
    const page = userObj.page;
    const home = new HomePage({ page: page });
    const meetingItem = await home.getMeetingListItem(meetingTitle);
    const expectedHeaders = ['detail', 'value'];
    validateDataTableHeaders(dataTable, expectedHeaders);
    const expectedDetails = dataTable.hashes();
    for (let i = 0; i < expectedDetails.length; i++) {
      const detail = expectedDetails[i].detail;
      if (detail === 'time' && expectedDetails[i].value === '%date_time_format%') {
        await assert(
          await meetingItem.textContent(),
          'toMatch',
          /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - \d{2}:\d{2}/,
          `Expected the meeting "${meetingTitle}" to display its time in the format "DD/MM/YYYY HH:MM - HH:MM"`
        );
      } else if (['time', 'meeting title', 'creator'].includes(detail)) {
        await assert(
          meetingItem,
          'toContainText',
          expectedDetails[i].value,
          `Expected the meeting "${meetingTitle}" to display "${expectedDetails[i].value}" for detail "${detail}"`
        );
      } else {
        throw new Error(`Unknown detail: '${detail}'`);
      }
    }
  }
);

Then(
  'the following buttons should be displayed for meeting {string} on the Home-Page for {string}:',
  async function (this: CustomWorld, meetingTitle: string, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const expectedDetails = dataTable.raw().map(([value]) => value);
    for (const button of expectedDetails) {
      switch (button) {
        case '3-dot option':
          await assert(
            await home.getThreeDotMenuOfMeeting(meetingTitle),
            'toBeVisible',
            `Expected the 3-dot options button for meeting "${meetingTitle}" to be visible on the Home-Page`
          );
          break;
        case 'Start':
          await assert(
            await home.getStartMeetingButton(meetingTitle),
            'toBeVisible',
            `Expected the "Start" button for meeting "${meetingTitle}" to be visible on the Home-Page`
          );
          break;
        default:
          throw new Error(`${button} button is not available`);
      }
    }
  }
);

Then(
  /^there should be (\d+) meetings? with the name "([^"]*)" on the Home-Page for "([^"]*)"$/,
  async function (this: CustomWorld, expectedCountOfMeetings: number, meetingTitle: string, user: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const actualMeetingCount = (await home.getAllMeetingListItems(meetingTitle)).length;
    await assert(
      actualMeetingCount,
      'toBe',
      expectedCountOfMeetings,
      `Expected to have ${expectedCountOfMeetings} meetings with the name ${meetingTitle} but got ${actualMeetingCount} meetings`
    );
  }
);

Then(
  'for {string} following details should be displayed on Home-Page',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const expectedDetails = dataTable.raw().map(([value]) => value);
    for (const detail of expectedDetails) {
      switch (detail) {
        case 'no-favorite-meetings-text':
          await assert(
            home.noFavoritesSelector,
            'toBeVisible',
            'Expected the "no favorite meetings" message to be visible on the Home-Page'
          );
          break;
        case 'bookmark icon':
          await assert(
            await home.favoriteMeetingsIcons.count(),
            'toBe',
            1,
            'Expected exactly one bookmark icon to be displayed in the favorite meetings section on the Home-Page'
          );
          break;
        default:
          throw new Error(`${detail} is a typo or an unexpected detail`);
      }
    }
  }
);

When('{string} selects {string} on the Home-Page', async function (this: CustomWorld, user: string, element: string) {
  const page = this.getUser(user).page;
  const home = new HomePage({ page: page });
  if (element === 'no-favorite-meetings-text') {
    await home.navigateToMeetingListFromFavoritesMeetingListIfNoFavoriteMeetings();
  } else {
    throw new Error(`'${element}' is a typo or element does not exist`);
  }
});

Then('for {string} the Meetings list should be displayed', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const myMeeting = new MyMeetingsPage({ page });
  await assert(
    myMeeting.myMeetingsHeading,
    'toBeVisible',
    `Expected the "My Meetings" heading to be visible on the My Meetings page`
  );
});

When(
  '{string} hovers over {string} on the Home-Page',
  async function (this: CustomWorld, user: string, element: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    if (element === 'no-favorite-meetings-text') {
      await home.noFavoritesSelector.hover();
    } else {
      throw new Error(`${element} is a typo or element does not exist`);
    }
  }
);

When(
  '{string} marks the meeting named {string} as favorite on the Home-Page',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const home = await navigateToHomePage(this, user);
    await home.markMeetingAsFavourite(meetingTitle);
  }
);

Then(
  'for {string} a tooltip with the text {string} should be shown on the Home-Page',
  async function (this: CustomWorld, user: string, text: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    if (text === 'mark-favorites-tooltip') {
      await assert(
        home.markFavoritesTooltipMessage,
        'toBeVisible',
        'Tooltip message: "You can mark favourites over the menu in the card." should be visible'
      );
    } else {
      throw new Error(`${text} is a typo or element does not exist`);
    }
  }
);

Then(
  'for {string} the meeting {string} should be marked as favorite on the Home-Page',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await assert(
      await home.isMeetingFavorite(meetingTitle),
      'toBe',
      true,
      `Expected meeting "${meetingTitle}" to be marked as a favorite for user "${user}" on the Home-Page`
    );
  }
);

Then(
  'for {string} these meetings should be displayed under the My favorite meetings label with a bookmark icon on the Home-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const home = await navigateToHomePage(this, user);
    const expectedMeetings = dataTable.raw().map(([value]) => value);
    for (const meeting of expectedMeetings) {
      await assert(
        await home.getFavouriteMeetingSelector(meeting),
        'toBeVisible',
        `Expected favorite meeting "${meeting}" to be visible under "My favorite meetings" on the Home-Page`
      );
    }
    await assert(
      home.favoriteMeetingsIcons,
      'toBeVisible',
      'Expected a bookmark icon to be displayed for the favorite meetings on the Home-Page'
    );
  }
);

When(
  '{string} selects meeting {string} on the Home-Page',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await home.openFavoriteMeeting(meetingTitle);
  }
);

Then(
  '{string} should be on the Lobby-Page of the meeting named {string} created by {string}',
  async function (this: CustomWorld, user: string, meetingTitle: string, moderator: string) {
    let pages: Page[];
    try {
      const context = this.getUser(user).context;
      pages = context.pages();
    } catch (_e) {
      pages = [this.getStartedMeeting(moderator).participantMeetingRoomPages[user].page];
    }
    for (const page of pages) {
      const title = await page.title();
      if (title === `OpenTalk Meeting Invitation - "${meetingTitle}"`) {
        const lobby = new LobbyRoomPage({ page });
        const meetingTitleLocator = await lobby.getMeetingInvitationTitleLocator(meetingTitle);
        await assert(
          meetingTitleLocator,
          'toBeVisible',
          `Expected the meeting invitation title "${meetingTitle}" to be visible on the Lobby-Page for user "${user}"`
        );
      }
    }
  }
);

When(
  '{string} starts to join an existing meeting from the Home-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await home.joinExistingMeetingButton.click();
  }
);

Then(
  'for {string} Join a meeting now popup should be visible on Home-Page with following details:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await assert(
      home.joinExistingMeetingDialog,
      'toBeVisible',
      'Expected the "Join a meeting now" popup to be visible on the Home-Page'
    );

    const expectedDetails = dataTable.raw().map(([value]) => value);
    for (const detail of expectedDetails) {
      switch (detail) {
        case 'Join a meeting now':
          await assert(
            home.joinExistingMeetingHeading,
            'toBeVisible',
            'Expected the "Join a meeting now" heading to be visible in the popup on the Home-Page'
          );

          break;
        case 'Meeting ID (URL)':
          await assert(
            home.joinExistingMeetingInput,
            'toBeVisible',
            'Expected the "Meeting ID (URL)" input field to be visible in the "Join a meeting now" popup'
          );

          break;
        case 'Join':
          await assert(
            home.joinExistingMeetingJoinButton,
            'toBeVisible',
            'Expected the "Join" button to be visible in the "Join a meeting now" popup'
          );

          break;
        case 'Close':
          await assert(
            home.joinExistingMeetingCloseButton,
            'toBeVisible',
            'Expected the "Close" button to be visible in the "Join a meeting now" popup'
          );

          break;
        default:
          throw new Error(`${detail} detail is not available`);
      }
    }
  }
);

When(
  '{string} enters {string} as Meeting ID in the Join-a-meeting-now popup on the Home-Page',
  async function (this: CustomWorld, user: string, meetingLink: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    if (meetingLink === '') {
      await home.joinExistingMeetingInput.fill('');
    }
    await home.joinExistingMeetingInput.fill(meetingLink);
  }
);

Then(
  'for {string} an error with the text {string} should be visible in the Join-a-meeting-now popup on the Home-Page',
  async function (this: CustomWorld, user: string, errorMessage: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await assert(
      home.joinExistingMeetingErrorLabel,
      'toContainText',
      errorMessage,
      `Expected the Join-a-meeting-now popup error message for user "${user}" to contain "${errorMessage}".`
    );
  }
);

When(
  /^"([^"]*)" (?:tries to |)join the meeting in the Join-a-meeting-now popup on the Home-Page$/,
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await home.page.screenshot({ path: 'beforeJoining.png' });
    await home.joinExistingMeetingJoinButton.click();
  }
);

When('{string} closes Join-existing-meeting popup on the Home-Page', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const home = new HomePage({ page: page });
  await home.joinExistingMeetingCloseButton.click();
});

Then(
  'for {string} join existing meeting popup should not be visible on Home-Page',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    await assert(
      home.joinExistingMeetingDialog,
      'not toBeVisible',
      `Expected the Join-a-meeting-now popup to be hidden on the Home-Page for user "${user}".`
    );
  }
);

When('{string} navigates back from Lobby-Page', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const lobbyRoomPage = new LobbyRoomPage({ page });
  await lobbyRoomPage.backButton.click();
});

Then('{string} should be on the Home-Page', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const home = new HomePage({ page: page });
  await assert(
    home.currentMeetingsHeaderSelector,
    'toBeVisible',
    `Expected the current meetings heading to be visible on the Home-Page for user "${user}"`
  );
});

When('{string} selects the OpenTalk logo on the Lobby-Page', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const lobbyRoomPage = new LobbyRoomPage({ page });
  await lobbyRoomPage.openTalkLogo.click();
});

When(
  /^"([^"]*)" enters the meeting link of the meeting named "([^"]*)" as Meeting ID textbox in the Join-a-meeting-now popup on the Home-Page$/,
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const page = this.getUser(user).page;
    const api = this.getUser(user).api;
    const home = new HomePage({ page: page });
    const roomId = (await api.getMeetingByTitle(meetingTitle)).room.id;
    await home.joinExistingMeetingInput.fill(getMeetingLink(roomId));
    await home.joinExistingMeetingJoinButton.focus();
  }
);

Then(
  'for {string} only the room ID of the meeting named {string} should be visible in the input field of the Join-a-meeting-now popup on the Home-Page',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const page = this.getUser(user).page;
    const api = this.getUser(user).api;
    const home = new HomePage({ page: page });
    const roomId = (await api.getMeetingByTitle(meetingTitle)).room.id;
    await assert(
      home.joinExistingMeetingInput,
      'toHaveValue',
      roomId,
      `Expected the Join-a-meeting-now input for user "${user}" to contain only the room ID "${roomId}" for meeting "${meetingTitle}".`
    );
  }
);

Then('for {string} there should be no change in UI', async function (this: CustomWorld, user: string) {
  const page = this.getUser(user).page;
  const home = new HomePage({ page: page });
  await assert(
    home.currentMeetingsHeaderSelector,
    'toBeVisible',
    `Expected no UI change on the Home-Page for user "${user}"; the current meetings heading should remain visible`
  );
});

When(
  '{string} selects somewhere outside the join existing meeting popup',
  async function (this: CustomWorld, user: string) {
    const page = this.getUser(user).page;
    await page.click('body', {
      position: { x: 1, y: 1 },
    });
  }
);
