// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

test.describe('Conference', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  test.describe('SpeedTest', () => {
    test.skip('show stable connection message with a good connection', async ({ page }) => {
      await page.goto(process.env.INSTANCE_URL);
      await page.getByRole('link', { name: 'Start new' }).click();
      const conferencePagePromise = page.waitForEvent('popup');
      await page.getByRole('link', { name: 'Open Video Room' }).click();
      const conferencePage = await conferencePagePromise;
      await conferencePage.getByLabel('Start Speed-Test').click();
      await expect(conferencePage.getByLabel('Speed-Test', { exact: true })).toContainText(
        'Your internet connection is stable.You can join the call without any limitations.',
        { timeout: 30_000 }
      );
    });

    test('show slow connection message with a slow connection', async ({ page, browserName }) => {
      // throttling just works for chrome, so we need to skip the other browser
      test.skip(browserName === 'webkit' || browserName === 'firefox');

      await page.goto(process.env.INSTANCE_URL);
      await page.getByRole('link', { name: 'Start new' }).click();
      const conferencePagePromise = page.waitForEvent('popup');
      await page.getByRole('link', { name: 'Open Video Room' }).click();
      const conferencePage = await conferencePagePromise;

      // throttle network for chrome
      const client = await conferencePage.context().newCDPSession(conferencePage);
      await client.send('Network.enable');

      // downloadThroughput and uploadThroughput take Bytes as value, so we need to calculate from the expected Kilobits/s to Bytes/s
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (376 * 1000) / 8, // 376Kbps
        uploadThroughput: (376 * 1000) / 8, // 376Kbps
        latency: 70,
      });

      await conferencePage.getByLabel('Start Speed-Test').click();
      await expect(conferencePage.getByLabel('Speed-Test', { exact: true })).toContainText(
        'Your internet connection is slow.You can join the call with some limitations.',
        { timeout: 30_000 }
      );
    });
  });
});
