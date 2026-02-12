// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { When } from '@cucumber/cucumber';

import { CustomWorld } from '../cucumberWorld';

When(/^"([^"]*)" waits for (\d+) seconds$/, async function (this: CustomWorld, moderator: string, delayInS: number) {
  const page = this.getUser(moderator).page;
  await page.waitForTimeout(delayInS * 1000);
});
