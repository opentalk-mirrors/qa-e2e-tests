// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { config } from '../config';
import { CustomWorld, User } from '../e2e/cucumberWorld';
import { Api } from './Api';
import { JoinMeetingOptions, joinMeetingRoomAsGuest } from './meetingHelpers';

export async function joinGuestToMeeting(
  world: CustomWorld,
  moderator: string,
  guestLink: string,
  guestName: string,
  options?: JoinMeetingOptions
) {
  const userApi = new Api({
    url: config.CONTROLLER_HOST,
    userName: guestName,
  });
  const context = await world.init();
  const guestRoom = await joinMeetingRoomAsGuest(context, guestLink, guestName, options);
  world.setUsers({
    firstname: guestName,
    api: userApi,
    context: context,
    page: guestRoom[guestName].page,
  } as User);
  world.addParticipantMeetingRooms(moderator, guestRoom);
}

export async function joinGuestsToMeeting(
  world: CustomWorld,
  moderator: string,
  guestLink: string,
  guestBasename: string,
  numOfGuests: number,
  options?: JoinMeetingOptions,
  delay?: number
) {
  for (let i = 1; i <= numOfGuests; i++) {
    const guestName = guestBasename + i;
    if (delay) {
      const meeting = world.getStartedMeeting(moderator).meeting;
      await meeting.meetingRoomPage.page.waitForTimeout(delay);
    }
    await joinGuestToMeeting(world, moderator, guestLink, guestName, options);
  }
}
