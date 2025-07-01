// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { createAdhocMeeting, gotoLobby, gotoDashboard, gotoRoom } from '../../utils/pageUtils';

test.describe.skip('203_Help_Quick_Guide', () => {
  test('TC_001_Dashboard_Quick-Guide', async ({ page, context }) => {
    await gotoDashboard(page);
    await page.getByRole('link', { name: 'Help' }).click();
    await page.getByRole('link', { name: 'Documentation' }).click();

    const defaultViewportSize = page.viewportSize();

    // Test dashboard Quick Guide
    await expect(page.getByRole('cell', { name: 'OpenTalk Dashboard Quick Guide' })).toBeVisible();
    const dashboardQuickGuideButton = page
      .getByRole('row', { name: 'OpenTalk Dashboard Quick Guide' })
      .getByRole('button');
    await expect(dashboardQuickGuideButton).toBeVisible();
    const dashboardQuickGuidePagePromise = context.waitForEvent('page');
    await dashboardQuickGuideButton.click();
    const dashboardQuickGuidePage = await dashboardQuickGuidePagePromise;
    await dashboardQuickGuidePage.waitForLoadState();

    // evalute the size of the image, to have a full screenshot
    // unforunately, it's not straightforward to use an external funciton in page.evaluate()
    // https://stackoverflow.com/questions/73710551/function-is-not-defined-when-called-in-page-evaluate
    const dashboardQuickGuideSize = await dashboardQuickGuidePage.evaluate(() => {
      const image = document.querySelector('svg');
      const width = Math.round(image.getBoundingClientRect().width);
      const height = Math.round(image.getBoundingClientRect().height);
      return { width, height };
    });
    await dashboardQuickGuidePage.setViewportSize({
      width: dashboardQuickGuideSize.width,
      height: dashboardQuickGuideSize.height,
    });
    await expect(dashboardQuickGuidePage).toHaveScreenshot('OpenTalk_Dashboard_Quick_Guide.png');
    await dashboardQuickGuidePage.setViewportSize({
      width: defaultViewportSize.width,
      height: defaultViewportSize.height,
    });

    // Test conference Quick Guide
    await expect(page.getByRole('cell', { name: 'OpenTalk Conference Quick Guide' })).toBeVisible();
    const conferenceQuickGuideButton = page
      .getByRole('row', { name: 'OpenTalk Conference Quick Guide' })
      .getByRole('button');
    await expect(dashboardQuickGuideButton).toBeVisible();
    const conferenceQuickGuidePagePromise = context.waitForEvent('page');
    await conferenceQuickGuideButton.click();
    const conferenceQuickGuidePage = await conferenceQuickGuidePagePromise;
    await conferenceQuickGuidePage.waitForLoadState();

    // evalute the size of the image, to have a full screenshot
    const conferenceQuickGuideSize = await conferenceQuickGuidePage.evaluate(() => {
      const image = document.querySelector('svg');
      const width = Math.round(image.getBoundingClientRect().width);
      const height = Math.round(image.getBoundingClientRect().height);
      return { width, height };
    });
    await conferenceQuickGuidePage.setViewportSize({
      width: conferenceQuickGuideSize.width,
      height: conferenceQuickGuideSize.height,
    });
    await expect(conferenceQuickGuidePage).toHaveScreenshot('OpenTalk_Conference_Quick_Guide.png');
    await conferenceQuickGuidePage.setViewportSize({
      width: defaultViewportSize.width,
      height: defaultViewportSize.height,
    });
  });

  test('TC_002_Lobby_Quick-Guide', async ({ page }) => {
    const meetingLink = await createAdhocMeeting(page);
    await gotoLobby(page, meetingLink);
    const openQuickGuideButton = page.getByLabel('Open quick guide');
    await openQuickGuideButton.click();
    const quickGuide = page.getByRole('img', {
      name: 'OpenTalk Conference Quick Guide',
    });
    await expect(quickGuide).toBeVisible();

    // we click on the quick guide itself and the quick guide shall be still present
    await page.getByRole('img', { name: 'OpenTalk Conference Quick Guide' }).click();
    await expect(quickGuide).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(quickGuide).not.toBeVisible();

    // open again to test the close button
    await openQuickGuideButton.click();
    await expect(quickGuide).toBeVisible();
    // The label of the button is buggy, will be fixed in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1815
    const closeQuickGuideButton = page.getByRole('button', {
      name: 'close-button',
    });
    await closeQuickGuideButton.click();
    await expect(quickGuide).not.toBeVisible();
  });

  test('TC_003_Meeting Room_Quick-Guide', async ({ page }) => {
    const meetingLink = await createAdhocMeeting(page);
    await gotoRoom(page, meetingLink);
    const myMeetingMenu = page.getByLabel('My meeting');
    await myMeetingMenu.click();
    const quickGuideMenuItem = page.getByRole('menuitem', {
      name: 'Quick Guide',
    });
    await quickGuideMenuItem.click();

    const quickGuide = page.getByRole('img', {
      name: 'OpenTalk Conference Quick Guide',
    });
    await expect(quickGuide).toBeVisible();

    // we click on the quick guide itself and the quick guide shall be still present
    await page.getByRole('img', { name: 'OpenTalk Conference Quick Guide' }).click();
    await expect(quickGuide).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(quickGuide).not.toBeVisible();

    // go to the menu item again, now, using keyboard
    await myMeetingMenu.focus();
    await page.keyboard.press('Enter');
    // currently guick guide menu item is the first element in the menu, so we press enter again
    await page.keyboard.press('Enter');
    await expect(quickGuide).toBeVisible();
    // The label of the button is buggy, will be fixed in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1815
    const closeQuickGuideButton = page.getByRole('button', {
      name: 'close-button',
    });
    await closeQuickGuideButton.click();
    await expect(quickGuide).not.toBeVisible();
  });
});
