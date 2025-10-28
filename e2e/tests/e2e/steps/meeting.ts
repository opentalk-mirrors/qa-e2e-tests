// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { config } from '../../config';
import { OpenTalkEvent } from '../../helper/Api';
import { getClipboardContent } from '../../helper/clipboardHelpers';
import { substituteInLineCodes } from '../../helper/helper';
import {
  joinMeetingRoomAsGuest,
  joinMeetingRoomWithNGuests,
  startAdhocMeetingAsModerator,
} from '../../helper/meetingHelpers';
import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';
import { InviteGuestPopupPage } from '../../pages/MeetingRoom/InviteGuestPopupPage';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';
import { MyMeetingsPage } from '../../pages/MyMeetingsPage';
import { CustomWorld, ParticipantMeetingRoomPages, User } from '../cucumberWorld';

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
    const context = this.getUser(username).context;
    this.addParticipantMeetingRooms(username, await joinMeetingRoomAsGuest(context, meeting.guestLink, guest));
  }
);

When(
  '{int} guests join the meeting of {string}',
  async function (this: CustomWorld, numOfGuests: number, username: string) {
    const meeting = this.getStartedMeeting(username).meeting;
    const context = this.getUser(username).context;
    const guestRooms = await joinMeetingRoomWithNGuests(context, meeting.guestLink, 'guest', numOfGuests);
    this.addParticipantMeetingRooms(username, guestRooms);
  }
);

Given(
  '{int} guests have joined the meeting of {string}',
  async function (this: CustomWorld, numOfGuests: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    const context = this.getUser(user).context;
    const guestRooms = await joinMeetingRoomWithNGuests(context, meeting.guestLink, 'guest', numOfGuests);
    this.addParticipantMeetingRooms(user, guestRooms);
  }
);

Given(
  '{int} guests have joined the meeting of {string} with delay of {int} milliseconds',
  async function (this: CustomWorld, numOfGuests: number, user: string, delay: number) {
    const meeting = this.getStartedMeeting(user).meeting;
    const context = this.getUser(user).context;
    const guestRooms: ParticipantMeetingRoomPages = {};
    for (let i = 1; i <= numOfGuests; i++) {
      await meeting.meetingRoomPage.page.waitForTimeout(delay);
      const guestRoom = await joinMeetingRoomAsGuest(context, meeting.guestLink, `guest${i}`);
      Object.assign(guestRooms, guestRoom);
    }

    this.addParticipantMeetingRooms(user, guestRooms);
  }
);

When('{string} creates a guest link from the more-options menu', async function (this: CustomWorld, user: string) {
  const moreOptionsPage = await this.getStartedMeeting(user).meeting.meetingRoomPage.showMoreOptions();
  const inviteGuestPopupPage = await moreOptionsPage.inviteGuest();
  await inviteGuestPopupPage.createInvitation();
});

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

When('{string} copies the guest link into the clipboard', async function (this: CustomWorld, user: string) {
  const inviteGuestPopupPage = new InviteGuestPopupPage(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
  await inviteGuestPopupPage.copyToClipboard();
});

When(
  'a guest joins the meeting using the link in the clipboard of {string}',
  async function (this: CustomWorld, user: string) {
    const context = this.getUser(user).context;
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    const guestRoom = await joinMeetingRoomAsGuest(context, clipboardContent, 'guest_joined_inside_breakout_room');
    this.addParticipantMeetingRooms(user, guestRoom);
  }
);

Then(
  /^(\d+) participants? should be in the (?:meeting|breakout) room of "([^"]*)"$/,

  async function (this: CustomWorld, expectedNumOfParticipants: number, user: string) {
    const meeting = this.getStartedMeeting(user).meeting;
    await meeting.meetingRoomPage.page.bringToFront();
    await meeting.meetingRoomPage.selectModeratorToolHome();
    const actualNumOfParticipants = await meeting.meetingRoomPage.getNumberOfParticipantsInMeeting();
    expect(actualNumOfParticipants).toBe(expectedNumOfParticipants);
  }
);

Then(
  'the content of the clipboard of {string} should match {string}',
  async function (this: CustomWorld, user: string, regexToMatch: string) {
    regexToMatch = substituteInLineCodes(regexToMatch);
    const clipboardContent = await getClipboardContent(this.getStartedMeeting(user).meeting.meetingRoomPage.page);
    expect(clipboardContent).toMatch(new RegExp(regexToMatch));
  }
);

async function startAdhocMeeting(world: CustomWorld, username: string) {
  const page = world.getUser(username).page;
  world.setStartedMeeting(username, await startAdhocMeetingAsModerator(page));
  world.addParticipantMeetingRooms(username, {
    [username]: world.getStartedMeeting(username).meeting.meetingRoomPage,
  });
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
  options?: { Audio?: string }
): Promise<MeetingRoomPage> {
  await userToJoin.page.goto(`${config.INSTANCE_URL}/room/${meeting.room.id}`);
  const lobbyRoomPage = new LobbyRoomPage({ page: userToJoin.page });
  await lobbyRoomPage.renderLobbyPage();

  // Close the warning button in safari
  if (world.browser.browserType().name() === 'webkit') {
    await closeWebkitPopUp({ page: userToJoin.page });
  }

  if (options?.Audio === 'enabled') {
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
      guestLink: await user.api.getGuestLink(meeting.room.id),
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
    const options = optionsTable.rowsHash();
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
    const user = await api.getUser(invitedUser);
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
    const expectedDetails = expectedDetailsDataTable.hashes();
    for (let i = 0; i < expectedDetails.length; i++) {
      switch (expectedDetails[i].options) {
        case 'Edit':
          await expect(home.editMenuItem).toBeVisible();
          break;
        case 'Add to favorites':
          await expect(home.addToFavoriteMenuItem).toBeVisible();
          break;
        case 'Copy Meeting-Link':
          await expect(home.copyMeetingLinkMenuItem).toBeVisible();
          break;
        case 'Copy Guest-Link':
          await expect(home.copyGuestLinkMenuItem).toBeVisible();
          break;
        case 'Delete':
          await expect(home.deleteMenuItem).toBeVisible();
          break;
        case 'Details':
          await expect(home.detailsMenuItem).toBeVisible();
          break;
        case 'Decline':
          await expect(home.declineMenuItem).toBeVisible();
          break;
        default:
          throw new Error(`'${expectedDetails[i].options}' option is not available in 3-dot button menu`);
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
    const api = this.getUser(invitee).api;
    const meeting = await api.getMeetingByTitle(meetingTitle);
    expect(meeting.created_by.firstname).toBe(moderator);
    await api.acceptInvite(meeting.id);
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
    const options = optionsTable.rowsHash();

    const api = this.getUser(moderator).api;
    const meeting = await api.getMeetingByTitle(meetingTitle);
    const guestLink = await api.getGuestLink(meeting.room.id);
    const context = this.getUser(moderator).context;
    const guestRooms = await joinMeetingRoomWithNGuests(context, guestLink, 'guest', numOfGuests, {
      audio: options.Audio === 'enabled',
    });
    this.addParticipantMeetingRooms(moderator, guestRooms);
  }
);

Then(
  'the following details should be displayed for meeting {string} on the Home-Page for {string}:',
  async function (this: CustomWorld, meetingTitle: string, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const meetingItem = await home.getMeetingListItem(meetingTitle);
    const expectedDetails = dataTable.hashes();
    for (let i = 0; i < expectedDetails.length; i++) {
      switch (expectedDetails[i].detail) {
        case 'time':
          if (expectedDetails[i].value === '%date_time_format%') {
            expect(await meetingItem.textContent()).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - \d{2}:\d{2}/);
          } else {
            await expect(meetingItem).toContainText(expectedDetails[i].value);
          }
          break;
        case 'meeting title':
          await expect(meetingItem).toContainText(expectedDetails[i].value);
          break;
        case 'creator':
          await expect(meetingItem).toContainText(expectedDetails[i].value);
          break;
        default:
          throw new Error(`${expectedDetails[i].options} detail is not available`);
      }
    }
  }
);

Then(
  'the following buttons should be displayed for meeting {string} on the Home-Page for {string}:',
  async function (this: CustomWorld, meetingTitle: string, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const expectedDetails = dataTable.hashes();
    for (let i = 0; i < expectedDetails.length; i++) {
      switch (expectedDetails[i].buttons) {
        case '3-dot option':
          await expect(await home.getStartMeetingButton(meetingTitle)).toBeVisible();
          break;
        case 'Start':
          await expect(await home.getStartMeetingButton(meetingTitle)).toBeVisible();
          break;
        default:
          throw new Error(`${expectedDetails[i].options} button is not available`);
      }
    }
  }
);

Then(
  /^there should be (\d+) meetings? with the name "([^"]*)" on the Home-Page for "([^"]*)"$/,
  async function (this: CustomWorld, expectedCountOfMeetings: number, meetingTitle: string, user: string) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    expect((await home.getAllMeetingListItems(meetingTitle)).length).toBe(expectedCountOfMeetings);
  }
);

Then(
  'for {string} following details should be displayed on Home-Page',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const page = this.getUser(user).page;
    const home = new HomePage({ page: page });
    const expectedDetails = dataTable.hashes();
    for (let i = 0; i < expectedDetails.length; i++) {
      switch (expectedDetails[i].details) {
        case 'no-favorite-meetings-text':
          await expect(home.noFavoritesSelector).toBeVisible();
          break;
        case 'bookmark icon':
          expect(await home.favoriteMeetingsIcons.count()).toBe(1);
          break;
        default:
          throw new Error(`${expectedDetails[i].details} is a typo or an unexpected detail`);
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
  const myMeeting = new MyMeetingsPage(page);
  await expect(myMeeting.myMeetingsHeading).toBeVisible();
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
      home.page.getByText('You can mark favourites over the menu in the card.');
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
    expect(await home.isMeetingFavorite(meetingTitle)).toBe(true);
  }
);

Then(
  'for {string} these meetings should be displayed under the My favorite meetings label with a bookmark icon on the Home-Page:',
  async function (this: CustomWorld, user: string, dataTable: DataTable) {
    const home = await navigateToHomePage(this, user);
    const expectedMeetings = dataTable.hashes();
    for (let i = 0; i < expectedMeetings.length; i++) {
      await expect(await home.getFavouriteMeetingSelector(expectedMeetings[i].meeting)).toBeVisible();
    }
    await expect(home.favoriteMeetingsIcons).toBeVisible();
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
  '{string} should be on the Lobby-Page of the meeting named {string}',
  async function (this: CustomWorld, user: string, meetingTitle: string) {
    const context = this.getUser(user).context;
    const pages = context.pages();
    for (const page of pages) {
      const title = await page.title();
      if (title === `OpenTalk Meeting Invitation - "${meetingTitle}"`) {
        const lobby = new LobbyRoomPage({ page });
        const meetingTitleLocator = await lobby.getMeetingInvitationTitleLocator(meetingTitle);
        await expect(meetingTitleLocator).toBeVisible();
      }
    }
  }
);
