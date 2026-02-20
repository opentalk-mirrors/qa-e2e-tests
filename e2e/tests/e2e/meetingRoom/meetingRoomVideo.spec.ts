// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';
import fs from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { joinMeetingRoomAsGuest, startAdhocMeetingAsModerator } from '../../helper/meetingHelpers';
import { MeetingRoomPage } from '../../pages/MeetingRoom/MeetingRoomPage';

test.describe('Test if video is working', { tag: '@late' }, () => {
  let meetingRoomPage: MeetingRoomPage, guestLink: string, guestMeetingRoomPage: MeetingRoomPage;
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page, context, browserName }) => {
    ({ meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName));
    guestMeetingRoomPage = (await joinMeetingRoomAsGuest(context, guestLink, 'guest1'))['guest1'];
  });

  test('video of other participant is being played', async ({ browserName }) => {
    test.skip(browserName === 'webkit');
    test.skip(browserName === 'firefox');
    await guestMeetingRoomPage.page.bringToFront();
    await guestMeetingRoomPage.turnCameraOn();
    await meetingRoomPage.page.bringToFront();
    const isPlaying = await meetingRoomPage.isVideoPlaying();
    expect(isPlaying).toBe(true);
  });

  test('local video is being played', async ({ browserName }) => {
    test.skip(browserName === 'webkit');
    test.skip(browserName === 'firefox');
    await guestMeetingRoomPage.page.bringToFront();
    await guestMeetingRoomPage.turnCameraOn();
    const isPlaying = await guestMeetingRoomPage.isVideoPlaying();
    expect(isPlaying).toBe(true);
  });

  test('check video content', async ({ browserName }) => {
    test.skip(browserName === 'webkit');
    test.skip(browserName === 'firefox');
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.toggleFullScreen();
    await guestMeetingRoomPage.page.bringToFront();
    await guestMeetingRoomPage.turnCameraOn();

    await new Promise((res) => setTimeout(res, 1_000));
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.page.screenshot({ path: 'green.png' });

    await new Promise((res) => setTimeout(res, 5_000));
    await meetingRoomPage.page.screenshot({ path: 'red.png' });

    ['red', 'green'].forEach((image) => {
      const actual = PNG.sync.read(fs.readFileSync(`${image}.png`));
      const expected = PNG.sync.read(fs.readFileSync(`e2e/tests/e2e/filesForTesting/${image}.png`));
      const { width, height } = actual;
      const diffi = new PNG({ width, height });
      const diff = pixelmatch(actual.data, expected.data, diffi.data, width, height, { threshold: 0.01 });
      fs.writeFileSync(`diff-${image}.png`, PNG.sync.write(diffi));
      const diffPercent = (diff / (width * height)) * 100;
      expect(diffPercent).toBeLessThan(10);
    });
  });
});
