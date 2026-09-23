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
    // skipped in webkit due to: https://git.opentalk.dev/opentalk/qa/e2e-tests/-/work_items/97
    test.skip(browserName === 'webkit');
    // Set fixed time in the browser/test environment to 10:00 AM preventing nightly failures
    const today = new Date().toISOString().slice(0, 10);
    await page.clock.setFixedTime(new Date(`${today}T10:00:00`));
    const instanceUrl = new URL(config.INSTANCE_URL);
    homePage = new HomePage({ page });
    await homePage.navigateToHomePage();

    const UUIDRegexString = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    const meetingLinkRegex = new RegExp(instanceUrl.host + '/room/' + UUIDRegexString + '$');
    const meetingPlanningPage = await homePage.planNewMeeting();
    await meetingPlanningPage.createNewMeeting(meetingTitle);
    await homePage.navigateToHomePage();
    const meetingDetailsPage = await homePage.showMeetingDetails(meetingTitle);
    const meetingLink = await meetingDetailsPage.getMeetingLink();
    expect(meetingLink).toMatch(meetingLinkRegex);
    await meetingDetailsPage.copyMeetingLinkToClipboard();
    expect(await getClipboardContent(page)).toEqual(meetingLink);

    await page.goto(meetingLink);
    const lobbyRoomPage = new LobbyRoomPage({ page });
    const meetingRoomPage = await lobbyRoomPage.enterMeetingRoom();
    expect(await meetingRoomPage.getMeetingRoomName()).toEqual(meetingTitle);
  });
});
