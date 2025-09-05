// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IWorldOptions, setWorldConstructor, World, ITestCaseHookParameter } from '@cucumber/cucumber';
import { chromium, Page, Browser, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

import { MeetingRoomPage } from '../pages/MeetingRoom/MeetingRoomPage';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  currentUser?: string;
  lastCreatedMeeting?: {
    meetingRoomPage: MeetingRoomPage;
    guestLink: string;
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    await this.context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    this.page = await this.context.newPage();
  }

  async cleanup(scenario: ITestCaseHookParameter) {
    if (scenario.result?.status === 'FAILED') {
      await this.context?.tracing.stop({
        path: `playwright-report/${scenario.pickle.name.replaceAll(' ', '-')}${new Date().toISOString().replaceAll(/[:.,]/g, '-')}.zip`,
      });
    } else {
      await this.context.tracing.stop();
    }

    await this.context?.close();
    await this.browser?.close();
    this.currentUser = undefined;
  }
}

setWorldConstructor(CustomWorld);
