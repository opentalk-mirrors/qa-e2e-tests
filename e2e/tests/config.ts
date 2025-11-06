// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

export const config = {
  USERNAME: process.env.USERNAME ?? 'test',
  PASSWORD: process.env.PASSWORD ?? 'testtest',
  USER_EMAIL: process.env.USER_EMAIL ?? 'alice@example.com',
  INSTANCE_URL: (process.env.INSTANCE_URL ?? 'https://localhost:8443').replace(/\/+$/, ''),
  CONTROLLER_HOST: (process.env.CONTROLLER_HOST ?? 'http://localhost:11311').replace(/\/+$/, ''),
  browser: process.env.BROWSER ?? 'chromium',
  headless: process.env.HEADLESS === 'true',
  slowMo: Number(process.env.SLOW_MO) || 0,
};
