// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export const config = {
  USERNAME: process.env.USERNAME ?? 'test',
  PASSWORD: process.env.PASSWORD ?? 'testtest',
  USER_EMAIL: process.env.USER_EMAIL ?? 'alice@example.com',
  INSTANCE_URL: process.env.INSTANCE_URL ?? 'http://localhost:3000',
  CONTROLLER_HOST: process.env.CONTROLLER_HOST ?? 'http://localhost:11311',
  browser: process.env.BROWSER ?? 'chromium',
  headless: process.env.HEADLESS === 'true',
  slowMo: Number(process.env.SLOW_MO) || 0,
};
