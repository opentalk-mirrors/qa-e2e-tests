// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CustomWorld, User } from '../e2e/cucumberWorld';
import { Api } from './Api';
import { JoinMeetingOptions, _joinMeetingRoomAsGuest } from './meetingHelpers';

export async function joinMeetingRoomAsGuest(
  world: CustomWorld,
  moderator: string,
  guestLink: string,
  guestName: string,
  options?: JoinMeetingOptions
): Promise<void> {
  const userApi = new Api({
    userName: guestName,
  });
  const context = await world.init();
  const guestRoom = await _joinMeetingRoomAsGuest(context, guestLink, guestName, options);
  world.setUsers({
    api: userApi,
    context: context,
    page: guestRoom[guestName].page,
    type: 'guest',
  } as User);
  world.addParticipantMeetingRooms(moderator, guestRoom);
}

export async function joinMeetingRoomWithNGuests(
  world: CustomWorld,
  moderator: string,
  guestLink: string,
  guestBasename: string,
  numOfGuests: number,
  options?: JoinMeetingOptions,
  delay?: number
): Promise<void> {
  for (let i = 1; i <= numOfGuests; i++) {
    const guestName = guestBasename + i;
    if (delay) {
      const meeting = world.getStartedMeeting(moderator).meeting;
      await meeting.meetingRoomPage.page.waitForTimeout(delay);
    }
    await joinMeetingRoomAsGuest(world, moderator, guestLink, guestName, options);
  }
}
