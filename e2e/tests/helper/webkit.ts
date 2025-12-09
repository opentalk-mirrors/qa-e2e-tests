// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

export const closeWebkitPopUp = async ({ page }: { page: Page }) => {
  // click the `OK` buttons on all pop-ups (there might be multiple)
  // but start with the last one
  // because otherwise if we try to click the first one, that will be gone
  // by the time we're trying to click the second one
  // and so there will be no second one to click
  const okButton = page.getByRole('button', { name: 'Ok', exact: true });
  const allButtons = await okButton.all();
  for (let i = allButtons.length - 1; i >= 0; i--) {
    await allButtons[i].click();
    await allButtons[i].waitFor({ state: 'detached' });
  }
};
