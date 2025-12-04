// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext, Locator } from '@playwright/test';

export async function navigateToExternalPage(context: BrowserContext, locatorToClick: Locator) {
  const pagePromise = context.waitForEvent('page');
  await locatorToClick.click();
  return await pagePromise;
}
