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
        undefined,
        'Expected the "Only Show Invites" button to be visible on the Meetings page.'
      );
      await assert(
        myMeetingsPage.favoriteMeetingButton,
        'toBeVisible',
        undefined,
        'Expected the "Only show favorites" button to be visible on the Meetings page.'
      );
      await assert(
        myMeetingsPage.planNewLink,
        'toBeVisible',
        undefined,
        'Expected the "Plan New" link to be visible on the Meetings page.'
      );
      await assert(
        myMeetingsPage.myMeetingsHeading,
        'toBeVisible',
        undefined,
        'Expected the "My Meetings" heading to be visible.'
      );
    });

    test('verify the contents displayed in the home option of dashboard', async ({ page }) => {
      const sidebarPage = new SidebarPage({ page });
      await sidebarPage.navigateToMyMeetingsPage();
      const homePage = await sidebarPage.navigateToHomePage();

      await assert(
        homePage.startNewMeetingButton,
        'toBeVisible',
        undefined,
        'Expected the "Start new" button to be visible on the home page.'
      );
      await assert(
        homePage.planNewMeetingButton,
        'toBeVisible',
        undefined,
        'Expected the "Plan new" button to be visible on the home page.'
      );
      await assert(
        homePage.favoriteMeetingsHeaderSelector,
        'toBeVisible',
        undefined,
        'Expected the "My favorite meetings" header to be visible on the home page.'
      );
      await assert(
        homePage.currentMeetingsHeaderSelector,
        'toBeVisible',
        undefined,
        'Expected the "Current meetings" header to be visible on the home page.'
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
