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
import { Page, Browser, BrowserContext, Response } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

import { Api } from '../helper/Api';
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
  meetingId: string;
}

interface StartedMeeting {
  meeting: Meeting;
  guestMeetingRoomPages: MeetingRoomPage[];
  crashReportResponse?: Response;
}

export type User = {
  firstname: string;
  api: Api;
  page: Page;
  context: BrowserContext;
};

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

  users?: {
    [key: string]: User;
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  setBrowser(browser: Browser): void {
    this.browser = browser;
  }

  setStartedMeeting(user: string, meeting: Meeting, crashReportResponse?: Response) {
    if (!this.startedMeetings) {
      this.startedMeetings = {};
    }
    this.startedMeetings[user] = { meeting, guestMeetingRoomPages: [], crashReportResponse };
  }

  setUsers(user: User) {
    if (!this.users) {
      this.users = {};
    }
    this.users[user.firstname] = user;
  }

  getUser(user: string): User {
    if (!this.users || !this.users[user]) {
      throw new Error('No users have been saved');
    }
    return this.users[user];
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
    let permissions: Array<string> = [];
    if (this.browser.browserType().name() === 'chromium') {
      permissions = ['clipboard-read', 'clipboard-write', 'camera', 'microphone'];
    }
    const context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    await context.grantPermissions(permissions);
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    return context;
  }

  async cleanup(scenario: ITestCaseHookParameter) {
    if (this.users) {
      for (const [_key, user] of Object.entries(this.users)) {
        const { api: api } = user;
        if (scenario.result?.status === 'FAILED') {
          await user.context?.tracing.stop({
            path: `playwright-report/${scenario.pickle.name.replaceAll(' ', '-')}${new Date().toISOString().replaceAll(/[:.,]/g, '-')}.zip`,
          });
        } else {
          await this.context?.tracing.stop();
        }

        await user.context.close();
        this.currentUser = undefined;
        api.deleteMeetings();
      }
    }
  }
}

setWorldConstructor(CustomWorld);
