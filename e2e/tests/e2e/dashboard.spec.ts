// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { globalSetup } from '../authHelpers';
import { config } from '../config';
import { assert } from '../helper/assertion';
import { deleteUser } from '../helper/keycloak';
import { HomePage } from '../pages/HomePage';
import { SidebarPage } from '../pages/SidebarPage';

test.describe('Dashboard', () => {
  test.describe('Sidebar Navigation/Options', () => {
    let userId = '';
    test.afterEach(async () => {
      await deleteUser(userId);
    });

    test.beforeEach(async ({ page, context }, testInfo) => {
      userId = await globalSetup(page, context, testInfo);
    });

    test('verify the contents displayed in the settings option of dashboard', async ({ page }) => {
      const homePage = new HomePage({ page });
      await homePage.navigateToHomePage();

      const sidebarPage = new SidebarPage({ page });
      const settingsPage = await sidebarPage.navigateToSettingsPage();

      await assert(
        settingsPage.generalLink,
        'toContainText',
        'General',
        'General settings link should be visible and contain "General".'
      );
      await assert(
        settingsPage.profileLink,
        'toContainText',
        'Profile',
        'Profile settings link should be visible and contain "Profile".'
      );
      await assert(
        settingsPage.accountLink,
        'toContainText',
        'Account',
        'Account settings link should be visible and contain "Account".'
      );
    });

    test('verify the contents displayed in the meetings option of dashboard', async ({ page }) => {
      const homePage = new HomePage({ page });
      await homePage.navigateToHomePage();

      const sidebarPage = new SidebarPage({ page });
      const myMeetingsPage = await sidebarPage.navigateToMyMeetingsPage();

      await assert(
        myMeetingsPage.onlyShowInvitesButton,
        'toBeVisible',
        'The "Only Show Invites" button should be visible on the Meetings page.'
      );
      await assert(
        myMeetingsPage.favoriteMeetingButton,
        'toBeVisible',
        'The "Only show favorites" button should be visible on the Meetings page.'
      );
      await assert(
        myMeetingsPage.planNewLink,
        'toBeVisible',
        'The "Plan New" link should be visible on the Meetings page.'
      );
      await assert(myMeetingsPage.myMeetingsHeading, 'toBeVisible', 'The "My Meetings" heading should be visible.');
    });

    test('verify the contents displayed in the home option of dashboard', async ({ page }) => {
      const sidebarPage = new SidebarPage({ page });
      await sidebarPage.navigateToMyMeetingsPage();
      const homePage = await sidebarPage.navigateToHomePage();

      await assert(
        homePage.startNewMeetingButton,
        'toBeVisible',
        'The "Start new" button should be visible on the home page.'
      );
      await assert(
        homePage.planNewMeetingButton,
        'toBeVisible',
        'The "Plan new" button should be visible on the home page.'
      );
      await assert(
        homePage.favoriteMeetingsHeaderSelector,
        'toBeVisible',
        'The "My favorite meetings" header should be visible on the home page.'
      );
      await assert(
        homePage.currentMeetingsHeaderSelector,
        'toBeVisible',
        '"Current meetings" header should be visible on the home page.'
      );
    });

    test.skip('logout from dashboard will redirect to signIn page', async ({ page }) => {
      await page.goto(`${config.INSTANCE_URL}/dashboard`);
      await page.locator('button').filter({ hasText: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      //Relogin user again
      await page.goto(config.INSTANCE_URL);
      await page.getByLabel('Username or email').fill(config.USER_NAME);
      await page.getByLabel('Username or email').press('Tab');
      await page.getByLabel('Password').fill(config.PASSWORD);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('link', { name: /(Start|Starten)$/ }).nth(1)).toBeVisible();
    });
  });
});
