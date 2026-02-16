// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { config } from '../../../config';
import {
  joinMeetingRoomAsGuest,
  joinMeetingRoomWithNGuests,
  startAdhocMeetingAsModerator,
} from '../../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../../pages/MeetingRoom/MeetingRoomPage';
import { ParticipantListWithCheckboxesPage } from '../../../pages/MeetingRoom/ModeratorTools/ParticipantListWithCheckboxesPage';
import { ResetRaisedHandsPage } from '../../../pages/MeetingRoom/ModeratorTools/ResetRaisedHandsPage';
import { ParticipantTilePage } from '../../../pages/MeetingRoom/ParticipantTilePage';
import { NotificationPage } from '../../../pages/NotificationPage';
import { ParticipantMeetingRoomPages } from '../../cucumberWorld';

const NUMBER_OF_GUESTS = 2;
const idleGuest = 'idleGuest';
const guest1 = 'guest1';
const guest2 = 'guest2';
const resetRaisedHandsNotificationText = 'Your raised hand was reset by the moderator';

let meetingRoomPage: MeetingRoomPage,
  guestLink: string,
  guestMeetingRoomPages: ParticipantMeetingRoomPages,
  idleGuestMeetingRoomPage: MeetingRoomPage,
  resetRaisedHandsPage: ResetRaisedHandsPage;

test.describe('Meeting Room_Reset raised hands selected button', () => {
  const guestName = [guest1, guest2];

  let guestTile: ParticipantTilePage, moderatorTile: ParticipantTilePage, idleGuestTile: ParticipantTilePage;

  test.beforeEach(async ({ page, context, browserName }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.raiseYourHand();
    guestMeetingRoomPages = await joinMeetingRoomWithNGuests(context, guestLink, 'guest', NUMBER_OF_GUESTS);

    for (const [_, guestMeetingRoomPage] of Object.entries(guestMeetingRoomPages)) {
      await guestMeetingRoomPage.page.bringToFront();
      await guestMeetingRoomPage.raiseYourHand();
    }
    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(context, guestLink, idleGuest);
    idleGuestMeetingRoomPage = participantMeetingRoomPages[idleGuest];
    // TODO: Need to add pre-condition to join meeting as 1 invited participants, once invited user scenario is implemented
  });

  test('TC_001_Meeting Room_As Moderator_Reset raised hands_All button, Selected button', async ({ page }) => {
    await expect(meetingRoomPage.toolBar.handLowerButton).toBeEnabled();
    expect(await meetingRoomPage.isHandRaised()).toBeTruthy();
    for (const [_, guestMeetingRoomPage] of Object.entries(guestMeetingRoomPages)) {
      await guestMeetingRoomPage.page.bringToFront();
      await expect(guestMeetingRoomPage.toolBar.handLowerButton).toBeEnabled();
      expect(await guestMeetingRoomPage.isHandRaised()).toBeTruthy();
    }
    await meetingRoomPage.page.bringToFront();
    resetRaisedHandsPage = await meetingRoomPage.startResetRaisedHandsModeratorTool();
    await expect(resetRaisedHandsPage.heading).toBeVisible();
    expect(await resetRaisedHandsPage.getHeadingText()).toBe('Reset raised hands');
    await expect(resetRaisedHandsPage.allButton).toBeVisible();
    await expect(resetRaisedHandsPage.selectedButton).toBeVisible();
    await expect(resetRaisedHandsPage.searchParticipantTextbox).toBeVisible();
    const participantListWithCheckboxesPage = new ParticipantListWithCheckboxesPage({
      page: resetRaisedHandsPage.page,
    });

    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(NUMBER_OF_GUESTS);

    for (const guest of guestName) {
      guestTile = meetingRoomPage.getParticipantTileByName(guest);
      expect(await guestTile.isHandRaised()).toBeTruthy();
    }
    idleGuestTile = meetingRoomPage.getParticipantTileByName(idleGuest);
    expect(await idleGuestTile.isHandRaised()).toBeFalsy();
    const firstGuestMeetingRoomPage = guestMeetingRoomPages['guest1'];
    const secondGuestMeetingRoomPage = guestMeetingRoomPages['guest2'];
    await firstGuestMeetingRoomPage.page.bringToFront();
    moderatorTile = firstGuestMeetingRoomPage.getParticipantTileByName(config.USER_NAME);
    expect(await moderatorTile.isHandRaised()).toBeTruthy();

    await meetingRoomPage.page.bringToFront();
    await resetRaisedHandsPage.resetAllRaisedHands();
    const moderatorNotification = new NotificationPage({ page: page });
    expect(await moderatorNotification.getAlertNotificationText()).toBe(resetRaisedHandsNotificationText);
    await expect(meetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(meetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await firstGuestMeetingRoomPage.page.bringToFront();
    const firstGuestNotification = new NotificationPage({ page: firstGuestMeetingRoomPage.page });
    expect(await firstGuestNotification.getAlertNotificationText()).toBe(resetRaisedHandsNotificationText);
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await secondGuestMeetingRoomPage.page.bringToFront();
    const secondGuestNotification = new NotificationPage({ page: secondGuestMeetingRoomPage.page });
    expect(await secondGuestNotification.getAlertNotificationText()).toBe(resetRaisedHandsNotificationText);
    await expect(secondGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(secondGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await meetingRoomPage.page.bringToFront();
    for (const guest of guestName) {
      guestTile = meetingRoomPage.getParticipantTileByName(guest);
      expect(await guestTile.isHandRaised()).toBeFalsy();
    }
    await firstGuestMeetingRoomPage.page.bringToFront();
    expect(await moderatorTile.isHandRaised()).toBeFalsy();
    await meetingRoomPage.page.bringToFront();
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(0);

    await meetingRoomPage.raiseYourHand();
    for (const [_, guestMeetingRoomPage] of Object.entries(guestMeetingRoomPages)) {
      await guestMeetingRoomPage.page.bringToFront();
      await guestMeetingRoomPage.raiseYourHand();
    }
    await meetingRoomPage.page.bringToFront();
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(NUMBER_OF_GUESTS);
    await participantListWithCheckboxesPage.selectParticipantByIndexes([0]); //select participant at index 0 i.e. of guest1
    expect(await participantListWithCheckboxesPage.isParticipantCheckboxCheckedAt(0)).toBeTruthy();

    await resetRaisedHandsPage.resetHandsOfSelectedParticipants();
    await firstGuestMeetingRoomPage.page.bringToFront();
    expect(await firstGuestNotification.getAlertNotificationText()).toBe(resetRaisedHandsNotificationText);
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await secondGuestMeetingRoomPage.page.bringToFront();
    await expect(secondGuestMeetingRoomPage.toolBar.handLowerButton).toBeEnabled();
    await expect(secondGuestMeetingRoomPage.toolBar.handLowerButton).toBeVisible();
    await idleGuestMeetingRoomPage.page.bringToFront();
    await expect(idleGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(idleGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await meetingRoomPage.page.bringToFront();
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(NUMBER_OF_GUESTS - 1);
  });
});

test.describe('Meeting Room_Reset raised hands search participant', () => {
  test.beforeEach(async ({ page, context, browserName }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    guestMeetingRoomPages = await joinMeetingRoomWithNGuests(context, guestLink, 'guest', NUMBER_OF_GUESTS);
    for (const [_, guestMeetingRoomPage] of Object.entries(guestMeetingRoomPages)) {
      await guestMeetingRoomPage.page.bringToFront();
      await guestMeetingRoomPage.raiseYourHand();
    }
    const participantMeetingRoomPages = await joinMeetingRoomAsGuest(context, guestLink, idleGuest);
    idleGuestMeetingRoomPage = participantMeetingRoomPages[idleGuest];
    // TODO: Need to add pre-condition to join meeting as 1 invited participants, once invited user scenario is implemented
    resetRaisedHandsPage = await meetingRoomPage.startResetRaisedHandsModeratorTool();
  });

  test('TC_002_Meeting Room_As Moderator_Reset raised hands_Search participant textbox', async () => {
    for (const [_, guestMeetingRoomPage] of Object.entries(guestMeetingRoomPages)) {
      await guestMeetingRoomPage.page.bringToFront();
      await expect(guestMeetingRoomPage.toolBar.handLowerButton).toBeEnabled();
      expect(await guestMeetingRoomPage.isHandRaised()).toBeTruthy();
    }

    await meetingRoomPage.page.bringToFront();
    await resetRaisedHandsPage.selectSearchParticipantTextbox();
    expect(await resetRaisedHandsPage.getPlaceholderValueOfSearchParticipantTextbox()).toBe('John Doe');

    await resetRaisedHandsPage.searchParticipantInList(guest1.slice(-2)); //extracts t1 from guest1
    const participantListWithCheckboxesPage = new ParticipantListWithCheckboxesPage({
      page: resetRaisedHandsPage.page,
    });

    await expect(participantListWithCheckboxesPage.getParticipantItemByName(guest1)).toBeVisible();
    await expect(participantListWithCheckboxesPage.getParticipantItemByName(guest2)).not.toBeVisible();
    await expect(participantListWithCheckboxesPage.getParticipantItemByName(idleGuest)).not.toBeVisible();
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(NUMBER_OF_GUESTS - 1);

    await participantListWithCheckboxesPage.selectParticipantByIndexes([0]); //select participant at index 0 i.e. of guest1
    expect(await participantListWithCheckboxesPage.isParticipantCheckboxCheckedAt(0)).toBeTruthy();

    await resetRaisedHandsPage.resetHandsOfSelectedParticipants();
    const firstGuestMeetingRoomPage = guestMeetingRoomPages['guest1'];
    const secondGuestMeetingRoomPage = guestMeetingRoomPages['guest2'];
    await firstGuestMeetingRoomPage.page.bringToFront();
    const firstGuestNotification = new NotificationPage({ page: firstGuestMeetingRoomPage.page });
    expect(await firstGuestNotification.getAlertNotificationText()).toBe(resetRaisedHandsNotificationText);
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(firstGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();
    await secondGuestMeetingRoomPage.page.bringToFront();
    await expect(secondGuestMeetingRoomPage.toolBar.handLowerButton).toBeEnabled();
    await expect(secondGuestMeetingRoomPage.toolBar.handLowerButton).toBeVisible();
    await idleGuestMeetingRoomPage.page.bringToFront();
    await expect(idleGuestMeetingRoomPage.toolBar.handRaiseButton).toBeEnabled();
    await expect(idleGuestMeetingRoomPage.toolBar.handRaiseButton).toBeVisible();

    await meetingRoomPage.page.bringToFront();
    await resetRaisedHandsPage.clearSearchedText();
    await expect(participantListWithCheckboxesPage.getParticipantItemByName(guest2)).toBeVisible();
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(NUMBER_OF_GUESTS - 1);

    await resetRaisedHandsPage.searchParticipantInList('abc');
    await expect(participantListWithCheckboxesPage.participantListCheckboxes).toHaveCount(0);

    await resetRaisedHandsPage.clearSearchedText();
    await expect(participantListWithCheckboxesPage.getParticipantItemByName(guest2)).toBeVisible();
  });
});
