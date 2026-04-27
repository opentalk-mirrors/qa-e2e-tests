// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, expect, BrowserContext } from '@playwright/test';

import { ParticipantMeetingRoomPages } from '../e2e/cucumberWorld';
import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';
import { MeetingRoomPage } from '../pages/MeetingRoom/MeetingRoomPage';
import { getGuestLink, planMeetingAsModerator, startAdhocMeetingAsModerator as startMeeting } from './Api';
import { closeWebkitPopUp } from './webkit';

// these escapes are useful, because it's a regex
/* eslint-disable no-useless-escape */
export const meetingUrlPatter =
  'https?:\/\/[a-z:0-9\.\-]+\/room\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\?invite=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
/* eslint-enable no-useless-escape */

export const startAdhocMeetingAsModerator = async (
  page: Page,
  browserName?: 'webkit' | 'chromium' | 'firefox',
  meetingTitlePrefix: string = 'Ad-hoc Meeting'
): Promise<{ meetingRoomPage: MeetingRoomPage; guestLink: string; meetingId: string }> => {
  const { meetingLink, roomId, meetingId } = await startMeeting(meetingTitlePrefix);
  const guestLink = await getGuestLink(roomId);
  await page.goto(meetingLink);
  const lobbyRoomPage = new LobbyRoomPage({ page });
  await lobbyRoomPage.renderLobbyPage();
  // Close warning button in safari
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }

  // enter meeting room & assert meeting room is shown
  const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();

  await meetingRoomPage.meetingRoomName.isVisible();
  expect(await meetingRoomPage.getMeetingRoomName()).toContain(meetingTitlePrefix);

  // only moderator is present before guests join
  expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(1);
  return { meetingRoomPage, guestLink, meetingId };
};

export const joinMeetingRoomAsGuest = async (
  context: BrowserContext,
  guestLink: string,
  guestName: string,
  options?: JoinMeetingOptions
): Promise<ParticipantMeetingRoomPages> => {
  // create new browser instance & launch OpenTalk with guest link
  const newPage = await context.newPage();
  await newPage.goto(guestLink);
  await newPage.waitForLoadState('domcontentloaded');

  const guestLobbyRoomPage = new LobbyRoomPage({ page: newPage });
  await expect(guestLobbyRoomPage.nameInputField).toBeVisible();

  // Close warning button in safari
  if (context.browser()?.browserType().name() === 'webkit') {
    await closeWebkitPopUp({ page: newPage });
  }

  await guestLobbyRoomPage.nameInputField.fill(guestName);
  if (options?.audio) {
    await guestLobbyRoomPage.waitForMicrophoneButtonToBeEnabled();
    await guestLobbyRoomPage.turnOnMicrophone();
  }

  // enter meeting room & assert meeting room is shown
  const guestMeetingRoomPage = await guestLobbyRoomPage.enterMeetingRoom();
  await guestMeetingRoomPage.meetingRoomName.waitFor();
  await expect(guestMeetingRoomPage.meetingRoomName).toBeVisible();

  return { [guestName]: guestMeetingRoomPage };
};

export class JoinMeetingOptions {
  audio: boolean = false;
}

export const planNewMeetingAndStartAsModerator = async (
  page: Page,
  meetingTitle: string,
  meetingPassword?: string,
  browserName?: 'webkit' | 'chromium' | 'firefox'
): Promise<{
  meetingRoomPage: MeetingRoomPage;
  guestLink: string;
  phoneDialIn: string;
  telephoneDialInNumber: string;
  conferenceId: string;
  conferencePin: string;
  meetingRoomName: string;
  roomId: string;
}> => {
  const homePage = new HomePage({ page });
  await homePage.navigateToHomePage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }

  await homePage.planNewMeeting();
  const { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin } = await planMeetingAsModerator(
    meetingTitle,
    meetingPassword
  );
  const guestLink = await getGuestLink(roomId);
  await page.goto(meetingLink);
  const lobbyRoomPage = new LobbyRoomPage({ page });
  await expect(lobbyRoomPage.nameInputField).toBeVisible(); // needed because of flakyness (see issue #1692)

  const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
  await meetingRoomPage.meetingRoomName.isVisible();
  const meetingRoomName = await meetingRoomPage.getMeetingRoomName();
  expect(meetingRoomName).toContain(meetingTitle);

  return {
    meetingRoomPage,
    guestLink,
    phoneDialIn: '',
    telephoneDialInNumber,
    conferenceId,
    conferencePin,
    meetingRoomName,
    roomId,
  };
};
