// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HelpPage } from '../../pages/HelpPage';

test.beforeEach('Navigate to help option', async ({ page, browserName, context }) => {
  const helpPage = new HelpPage({ page, context });
  await helpPage.navigateToHelpPage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Help', () => {
  test('TC_001_Dashboard_Help_User Manual', async ({ page, context }) => {
    const helpPage = new HelpPage({ page, context });
    await expect(helpPage.helpHeading).toBeVisible();
    await expect(helpPage.userManualLink).toBeVisible();
    await expect(helpPage.supportLink).toBeVisible();

    const userManualDocsPage = await helpPage.navigateToUserManual();
    expect(userManualDocsPage.url()).toMatch(/^https:\/\/docs\.opentalk\.eu\/.*$/);

    await helpPage.page.bringToFront();
    await expect(helpPage.helpHeading).toBeVisible();
  });

  test('TC_002_Dashboard_Help_Support', async ({ page, context }) => {
    const helpPage = new HelpPage({ page, context });

    const supportDocsPage = await helpPage.navigateToSupport();
    expect(supportDocsPage.url()).toMatch(/^https:\/\/opentalk\.eu\/.*$/);

    await helpPage.page.bringToFront();
    await expect(helpPage.helpHeading).toBeVisible();
  });
});
