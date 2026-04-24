// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, test } from '@playwright/test';

import { globalSetup } from '../../authHelpers';
import { config } from '../../config';
import { getClipboardContent } from '../../helper/clipboardHelpers';
import { deleteUser } from '../../helper/keycloak';
import { HomePage } from '../../pages/HomePage';
import { LobbyRoomPage } from '../../pages/LobbyRoomPage';

let homePage: HomePage;
const meetingTitle = 'Meeting room URL';

test.describe('Meeting room URL', async () => {
  let userId = '';

  test.beforeEach(async ({ page, context }, testInfo) => {
    userId = await globalSetup(page, context, testInfo);
  });

  test.afterEach(async () => {
    await deleteUser(userId);
  });

  test('TC_001_URL route in Dashboard + Meeting Room', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit'); // Copying to clipboard does not work in webkit
    // Set fixed time in the browser/test environment to 10:00 AM preventing nightly failures
    const today = new Date().toISOString().slice(0, 10);
    await page.clock.setFixedTime(new Date(`${today}T10:00:00`));
    const instanceUrl = new URL(config.INSTANCE_URL);
    homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    const UUIDRegexString = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    const meetingLinkRegex = new RegExp(instanceUrl.host + '/room/' + UUIDRegexString + '$');
    const guestLinkRegex = new RegExp(
      instanceUrl.host + '/room/' + UUIDRegexString + '\\?invite=' + UUIDRegexString + '$'
    );
    const meetingPlanningPage = await homePage.planNewMeeting();
    await meetingPlanningPage.createNewMeeting(meetingTitle);
    await homePage.navigateToHomePage();
    const meetingDetailsPage = await homePage.showMeetingDetails(meetingTitle);
    const meetingLink = await meetingDetailsPage.getMeetingLink();
    expect(meetingLink).toMatch(meetingLinkRegex);
    let guestLink = await meetingDetailsPage.getGuestLink();
    expect(guestLink).toMatch(guestLinkRegex);

    await meetingDetailsPage.copyMeetingLinkToClipboard();
    expect(await getClipboardContent(page)).toEqual(meetingLink);
    await meetingDetailsPage.copyGuestLinkToClipboard();
    expect(await getClipboardContent(page)).toEqual(guestLink);

    await page.goto(meetingLink);
    const lobbyRoomPage = new LobbyRoomPage({ page });
    const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
    expect(await meetingRoomPage.getMeetingRoomName()).toEqual(meetingTitle);

    const moreOptionsPage = await meetingRoomPage.showMoreOptions();
    const inviteGuestPopupPage = await moreOptionsPage.inviteGuest();
    await inviteGuestPopupPage.createInvitation();
    guestLink = await inviteGuestPopupPage.getGuestLink();
    expect(guestLink).toMatch(guestLinkRegex);

    await inviteGuestPopupPage.copyToClipboard();
    expect(await getClipboardContent(page)).toEqual(guestLink);
  });
});
