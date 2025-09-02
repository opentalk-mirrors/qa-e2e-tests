// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Before, After } from '@cucumber/cucumber';

import { CustomWorld } from './cucumberWorld';

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld, scenario) {
  await this.cleanup(scenario);
});
