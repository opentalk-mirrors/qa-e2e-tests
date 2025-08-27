// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium, Page, Browser, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

import { authUserFile } from '../authHelpers';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  currentUser?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext({ storageState: authUserFile });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    await this.context?.close();
    await this.browser?.close();
    this.currentUser = undefined;
  }
}

setWorldConstructor(CustomWorld);
