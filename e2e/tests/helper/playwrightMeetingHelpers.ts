// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Browser } from '@playwright/test';

import { ParticipantMeetingRoomPages } from '../e2e/cucumberWorld';
import { JoinMeetingOptions, joinMeetingRoomAsGuest } from './meetingHelpers';

export const joinGuestToMeeting = async (
  browser: Browser,
  guestLink: string,
  guestName: string,
  options?: JoinMeetingOptions
): Promise<ParticipantMeetingRoomPages> => {
  const context = await browser.newContext();
  return await joinMeetingRoomAsGuest(context, guestLink, guestName, options);
};

export const joinGuestsToMeeting = async (
  browser: Browser,
  guestLink: string,
  guestBaseName: string,
  numberOfGuests: number,
  options?: JoinMeetingOptions
): Promise<ParticipantMeetingRoomPages> => {
  let guestMeetingRoomPages: ParticipantMeetingRoomPages = {};
  for (let i = 1; i <= numberOfGuests; i++) {
    const guestUserName = guestBaseName + i;
    const guestMeetingRoomPage = await joinGuestToMeeting(browser, guestLink, guestUserName, options);
    guestMeetingRoomPages = { ...guestMeetingRoomPage, ...guestMeetingRoomPages };
  }
  return guestMeetingRoomPages;
};
