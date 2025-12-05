// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { LegalPage } from '../../pages/LegalPage';

test.beforeEach(async ({ page, browserName, context }) => {
  const legalPage = new LegalPage({ page, context });
  await legalPage.navigateToLegalPage();

  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Legal', () => {
  test('TC_001_Dashboard_Legal_Imprint & Data Protection', async ({ page, context }) => {
    const legalPage = new LegalPage({ page, context });
    await expect(legalPage.title).toHaveText('Legal');
    await expect(legalPage.imprintLink).toBeVisible();
    await expect(legalPage.dataProtectionLink).toBeVisible();

    const openTalkImprintPage = await legalPage.navigateToImprintPage();
    expect(openTalkImprintPage.url()).toMatch(/^https:\/\/opentalk\.eu\/.*$/);

    await legalPage.page.bringToFront();
    await expect(legalPage.title).toHaveText('Legal');

    const openTalkDataProtectionPage = await legalPage.navigateToDataProtectionPage();
    expect(openTalkDataProtectionPage.url()).toMatch(/^https:\/\/opentalk\.eu\/.*$/);

    await legalPage.page.bringToFront();
    await expect(legalPage.title).toHaveText('Legal');
  });
});
