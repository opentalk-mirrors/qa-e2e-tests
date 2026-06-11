// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

export const config = {
  USER_NAME: process.env.USER_NAME ?? 'test',
  USER_FIRSTNAME: process.env.USER_FIRSTNAME ?? 'test',
  USER_FAMILYNAME: process.env.USER_FAMILYNAME ?? 'test',
  PASSWORD: process.env.PASSWORD ?? 'testtest',
  USER_EMAIL: process.env.USER_EMAIL ?? 'alice%s@example.com',
  INSTANCE_URL: (process.env.INSTANCE_URL ?? 'https://localhost:8443').replace(/\/+$/, ''),
  CONTROLLER_HOST: (process.env.CONTROLLER_HOST ?? 'https://localhost:21311').replace(/\/+$/, ''),
  KC_HOST: (process.env.KC_HOST ?? 'https://localhost:7443').replace(/\/+$/, ''),
  KC_ADMIN: process.env.KC_ADMIN ?? 'admin',
  KC_ADMIN_PASSWORD: process.env.KC_ADMIN_PASSWORD ?? 'admin',
  KC_REALM: process.env.KC_REALM ?? 'OPENTALK',
  browser: process.env.BROWSER ?? 'chromium',
  headless: process.env.HEADLESS === 'true',
  slowMo: Number(process.env.SLOW_MO) || 0,
  TIMEOUT: Number(process.env.TIMEOUT) || 120 * 1000,
  LONG_TIMEOUT: Number(process.env.LONG_TIMEOUT) || 30 * 1000,
  MEDIUM_TIMEOUT: Number(process.env.MEDIUM_TIMEOUT) || 10 * 1000,
  SHORT_TIMEOUT: Number(process.env.SHORT_TIMEOUT) || 5 * 1000,
};
