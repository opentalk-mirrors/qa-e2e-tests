// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test as setup } from '@playwright/test';

import { globalSetup } from './authHelpers';

export const authUserFile = '.auth/user.json';

setup('authenticate and set english language', async () => {
  // Perform authentication steps.
  await globalSetup();
});
