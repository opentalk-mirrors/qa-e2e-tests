// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test } from '@playwright/test';

import { globalSetup } from '../authHelpers';
import { assert } from '../helper/assertion';
import { deleteUser } from '../helper/keycloak';
import { HomePage } from '../pages/HomePage';
import { LobbyRoomPage } from '../pages/LobbyRoomPage';

test.describe('Conference', () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('SpeedTest', () => {
    let userId = '';
    let lobbyRoomPage: LobbyRoomPage;

    test.afterEach(async () => {
      await deleteUser(userId);
    });

    test.beforeEach(async ({ page, context }, testInfo) => {
      userId = await globalSetup(page, context, testInfo);
      const homePage = new HomePage({ page });
      await homePage.navigateToHomePage();

      const meetingInvitationPage = await homePage.startAdhocMeeting();

      lobbyRoomPage = await meetingInvitationPage.goToMeetingLobbyPage();
    });

    test('show stable connection message with a good connection', async ({ browserName }) => {
      test.skip(browserName === 'webkit');

      await lobbyRoomPage.runSpeedTest();

      await assert(
        lobbyRoomPage.speedTestResultLabel,
        'toContainText',
        'Your internet connection is stable.You can join the call without any limitations.',
        'Speed test result should indicate a stable connection without limitations'
      );
    });

    test('show slow connection message with a slow connection', async ({ browserName }) => {
      // throttling just works for chrome, so we need to skip the other browser
      test.skip(browserName === 'webkit' || browserName === 'firefox');

      // throttle network for chrome
      const client = await lobbyRoomPage.page.context().newCDPSession(lobbyRoomPage.page);
      await client.send('Network.enable');

      // downloadThroughput and uploadThroughput take Bytes as value, so we need to calculate from the expected Kilobits/s to Bytes/s
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (376 * 1000) / 8, // 376Kbps
        uploadThroughput: (376 * 1000) / 8, // 376Kbps
        latency: 70,
      });

      await lobbyRoomPage.runSpeedTest();

      await assert(
        lobbyRoomPage.speedTestResultLabel,
        'toContainText',
        'Your internet connection is slow.You can join the call with some limitations.',
        'Speed test result should indicate a slow connection with limitations'
      );
    });
  });
});
