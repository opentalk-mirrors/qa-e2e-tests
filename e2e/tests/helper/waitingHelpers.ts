// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

export const waitForDomStopChanging = async (page: Page, pollDelay = 50, stableDelay = 350): Promise<void> => {
  let markupPrevious = '';
  const timerStart = new Date();
  let isStable = false;
  while (!isStable) {
    const markupCurrent = await page.evaluate(() => document.body.innerHTML);
    const elapsed = new Date().getTime() - timerStart.getTime();
    if (markupCurrent == markupPrevious) {
      isStable = stableDelay <= elapsed;
    } else {
      markupPrevious = markupCurrent;
    }
    if (!isStable) {
      await new Promise((resolve) => setTimeout(resolve, pollDelay));
    }
  }
};
