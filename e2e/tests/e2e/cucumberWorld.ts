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
import { chromium, Page, Browser, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

import { MeetingRoomPage } from '../pages/MeetingRoom/MeetingRoomPage';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

interface Meeting {
  meetingRoomPage: MeetingRoomPage;
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
    const env = process.env.HEADLESS?.toLowerCase() ?? 'true';
    const headless = env !== 'false';
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    await this.context.grantPermissions(['clipboard-read', 'clipboard-write', 'camera', 'microphone']);
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
