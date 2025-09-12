// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  IWorldOptions,
  setWorldConstructor,
  World,
  ITestCaseHookParameter,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, Page, Browser, BrowserContext, webkit, firefox, BrowserType } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

import { config } from '../config';
import { MeetingRoomPage } from '../pages/MeetingRoom/MeetingRoomPage';
import { BreakoutRoomsPage } from '../pages/MeetingRoom/ModeratorTools/BreakoutRoomsPage';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

interface Meeting {
  meetingRoomPage: MeetingRoomPage;
  moderatorTools?: {
    breakoutRooms?: {
      breakoutRoomsPage?: BreakoutRoomsPage;
    };
  };

  guestLink: string;
}

interface StartedMeeting {
  meeting: Meeting;
  guestMeetingRoomPages: MeetingRoomPage[];
}

setDefaultTimeout(60 * 1000);

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  currentUser?: string;

  // key is the username of the moderator who created the meeting
  startedMeetings?: {
    [key: string]: StartedMeeting;
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  setStartedMeeting(user: string, meeting: Meeting) {
    if (!this.startedMeetings) {
      this.startedMeetings = {};
    }
    this.startedMeetings[user] = { meeting, guestMeetingRoomPages: [] };
  }

  getStartedMeeting(moderator: string): StartedMeeting {
    if (!this.startedMeetings || !this.startedMeetings[moderator]) {
      throw new Error('No meeting has been created yet');
    }
    return this.startedMeetings[moderator];
  }

  addGuestMeetingRooms(moderator: string, guestMeetingRoomPages: MeetingRoomPage[]) {
    if (!this.startedMeetings || !this.startedMeetings[moderator]) {
      throw new Error('No meeting has been created yet');
    }
    this.startedMeetings[moderator].guestMeetingRoomPages =
      this.startedMeetings[moderator].guestMeetingRoomPages.concat(guestMeetingRoomPages);
  }

  async init() {
    const browserName = config.browser;

    let browserType: BrowserType<Browser>;
    let permissions: Array<string>;
    let args = [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--allow-file-access',
      '--guest',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ];
    let firefoxUserPrefs: { [key: string]: string | number | boolean } = {
      'permissions.default.microphone': 1,
      'permissions.default.camera': 1,
      'media.navigator.streams.fake': true,
      'media.navigator.permission.disabled': true,
      'dom.events.testing.asyncClipboard': true,
      'dom.events.asyncClipboard.readText': true,
      'dom.events.asyncClipboard.clipboardItem': true,
      'dom.events.asyncClipboard.writeText': true,
      'permissions.default.clipboard-read': 1,
      'permissions.default.clipboard-write': true,
    };

    switch (browserName) {
      case 'firefox':
        browserType = firefox;
        permissions = [];
        break;
      case 'webkit':
        browserType = webkit;
        permissions = [];
        args = [];
        firefoxUserPrefs = {};
        break;
      default:
        browserType = chromium;
        permissions = ['clipboard-read', 'clipboard-write', 'camera', 'microphone'];
    }

    this.browser = await browserType.launch({
      slowMo: config.slowMo,
      headless: config.headless,
      args: args,
      firefoxUserPrefs: firefoxUserPrefs,
    });
    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    await this.context.grantPermissions(permissions);
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
