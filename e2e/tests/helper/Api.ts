// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { readFileSync, readFile } from 'node:fs';

import { config } from '../config';

async function makeRequest(params: string, method: string = 'GET', body?: object, headers: Headers = new Headers()) {
  const dataArray = JSON.parse(readFileSync('.auth/user.json', 'utf-8'));
  const localStorage = dataArray.origins[0].localStorage;
  const accessToken = localStorage.find((item: { name: string; value: string }) => item.name === 'access_token')?.value;
  headers.append('content-type', 'application/json');
  headers.append('authorization', 'Bearer ' + accessToken);
  const bodyString = JSON.stringify(body);

  const requestOptions = {
    headers: headers,
    body: bodyString,
    method: method,
  };

  return fetch(`${config.CONTROLLER_HOST}${params}`, requestOptions);
}

export async function changeLanguage(lang: string) {
  if (!/[a-z]{2}-[A-Z]{2}/.test(lang)) {
    throw new Error('Not a valid Language');
  }
  let currentLangResponse: Response;
  let currentLangResponseJSON: { language: string };
  do {
    const response = await makeRequest(`/v1/users/me`, 'PATCH', { language: lang });
    if (response.status !== 200) {
      throw new Error(`Could not change language. Response code ${response.status}`);
    }
    currentLangResponse = await makeRequest(`/v1/users/me`, 'GET');
    if (currentLangResponse.status !== 200) {
      throw new Error(`Could not read current language. Response code ${currentLangResponse.status}`);
    }
    currentLangResponseJSON = await currentLangResponse.json();
  } while (currentLangResponseJSON.language != lang);
}

export function validateUserJson(authUserFilePath: string) {
  try {
    readFile(authUserFilePath, { encoding: 'utf8', flag: 'r' }, (error, data) => {
      if (error) {
        throw new Error(`${error.message}. \nCan not read file at ${authUserFilePath}`);
      }
      const dataArray = JSON.parse(data);
      if (dataArray.origins[0].localStorage[3].value === undefined) {
        throw new Error(`${authUserFilePath} does not contain "access_token"`);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${authUserFilePath} does not contain valid storage state. \n${error.message}`);
    }
    throw error;
  }
}

export async function createMeeting(payload: object): Promise<{
  meetingLink: string;
  roomId: string;
  meetingId: string;
  telephoneDialInNumber: string;
  conferenceId: string;
  conferencePin: string;
}> {
  try {
    const response = await makeRequest(`/v1/events`, 'POST', payload);
    const json = await response.json();
    const roomId = json.room.id;
    const meetingId = json.id;
    const meetingLink = `${config.INSTANCE_URL}/room/${roomId}`;
    const telephoneDialInNumber = json.room.call_in?.tel ?? '',
      conferenceId = json.room.call_in?.id ?? '',
      conferencePin = json.room.call_in?.password ?? '';
    return { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin, meetingId };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function startAdhocMeetingAsModerator(
  meetingTitlePrefix: string
): Promise<{ meetingLink: string; roomId: string; meetingId: string }> {
  const payload: object = {
    description: '',
    e2e_encryption: false,
    is_adhoc: true,
    is_time_independent: true,
    title: `${meetingTitlePrefix} ${new Date().toTimeString().slice(0, 5)}`,
    waiting_room: false,
  };

  const { meetingLink, roomId, meetingId } = await createMeeting(payload);

  return { meetingLink, roomId, meetingId };
}

export async function getGuestLink(roomId: string): Promise<string> {
  try {
    const getGuestLinkResponse = await makeRequest(`/v1/rooms/${roomId}/invites`, 'POST', {});
    const getGuestLinkJson = await getGuestLinkResponse.json();
    const guestLink = `${config.INSTANCE_URL}/room/${roomId}?invite=${getGuestLinkJson.invite_code}`;

    return guestLink;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function planMeetingAsModerator(
  title: string,
  password?: string
): Promise<{
  meetingLink: string;
  roomId: string;
  telephoneDialInNumber: string;
  conferenceId: string;
  conferencePin: string;
}> {
  const now = new Date();
  const start = new Date(now.getTime() + 5 * 60 * 1000);
  const end = new Date(now.getTime() + 35 * 60 * 1000);

  const payload = {
    title,
    description: '',
    waiting_room: false,
    show_meeting_details: true,
    password,
    is_time_independent: false,
    is_adhoc: false,
    has_shared_folder: false,
    streaming_targets: [],
    e2e_encryption: false,
    starts_at: {
      datetime: start.toISOString(),
      timezone: 'Asia/Kathmandu',
    },
    ends_at: {
      datetime: end.toISOString(),
      timezone: 'Asia/Kathmandu',
    },
    is_all_day: false,
  };

  const { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin } = await createMeeting(payload);

  return { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin };
}

type MeetingTime = {
  datetime: string;
  timezone: string;
};

type MyFunctionParams = {
  title: string;
  description?: string;
  waiting_room?: boolean;
  show_meeting_details?: boolean;
  password?: string;
  is_time_independent?: boolean;
  is_adhoc?: boolean;
  has_shared_folder?: boolean;
  streaming_targets?: Array<string>;
  e2e_encryption?: boolean;
  starts_at?: MeetingTime;
  ends_at?: MeetingTime;
  timezone?: string;
  is_all_day?: boolean;
};

type User = {
  kind: 'registered';
  id: string;
  email: string;
  title: string;
  firstname: string;
  lastname: string;
  display_name: string;
  avatar_url: string;
};

interface OpenTalkEvent {
  can_edit: boolean;
  created_at: string;
  created_by: UserProfile;
  description: string;
  id: string;
  invite_status: 'pending' | 'accepted' | 'tentative' | 'declined';
  invitees: Invitee[];
  invitees_truncated: boolean;
  is_adhoc: boolean;
  is_favorite: boolean;
  is_time_independent: boolean;
  room: Room;
  shared_folder: {
    read: {
      password: string;
      url: string;
    };
  };
  show_meeting_details: boolean;
  starts_at: {
    datetime: string;
    timezone: string;
  };
  streaming_targets: StreamingTarget[];
  title: string;
  training_participation_report: {
    checkpoint_interval: {
      after: number;
      within: number;
    };
    initial_checkpoint_delay: {
      after: number;
      within: number;
    };
  };
  type: 'single' | 'recurring';
  updated_at: string;
  updated_by: UserProfile;
}

interface UserProfile {
  avatar_url: string;
  display_name: string;
  email: string;
  firstname: string;
  id: string;
  lastname: string;
  title: string;
}

interface Invitee {
  profile: InviteeProfile;
  status: 'pending' | 'accepted' | 'tentative' | 'declined';
}

interface InviteeProfile extends UserProfile {
  kind: 'registered' | 'guest';
  role: 'user' | 'admin' | 'moderator'; // add other roles if necessary
}

interface Room {
  call_in: {
    id: string;
    password: string;
    tel: string;
  };
  e2e_encryption: boolean;
  id: string;
  password: string;
  waiting_room: boolean;
}

interface StreamingTarget {
  id: string;
  kind: 'custom' | 'youtube' | 'facebook';
  name: string;
  public_url: string;
  streaming_endpoint: string;
  streaming_key: string;
}

export class Api {
  url: string;
  accessToken?: string;
  userName: string;

  constructor({ url, accessToken, userName }: { url: string; accessToken?: string; userName: string }) {
    this.url = url;
    this.accessToken = accessToken;
    this.userName = userName;
  }

  makeRequest(params: string, method: string = 'GET', body?: object, headers: Headers = new Headers()) {
    headers.append('content-type', 'application/json');
    headers.append('authorization', 'Bearer ' + this.accessToken);
    const bodyString = JSON.stringify(body);
    const requestOptions = {
      headers: headers,
      body: bodyString,
      method: method,
    };
    return fetch(`${this.url}${params}`, requestOptions);
  }

  async changeLanguage(lang: string) {
    if (!/[a-z]{2}-[A-Z]{2}/.test(lang)) {
      throw new Error('Not a valid Language');
    }
    let currentLangResponse: Response;
    let currentLangResponseJSON: { language: string };
    do {
      const response = await this.makeRequest(`/v1/users/me`, 'PATCH', { language: lang });
      if (response.status !== 200) {
        console.error(`Could not change language. Response code ${response.status}`);
      }
      currentLangResponse = await this.makeRequest(`/v1/users/me`, 'GET');
      if (currentLangResponse.status !== 200) {
        console.error(`Could not read current language. Response code ${currentLangResponse.status}`);
      }
      currentLangResponseJSON = await currentLangResponse.json();
    } while (currentLangResponseJSON.language != lang);
  }

  async createMeeting(payload: object): Promise<{
    meetingLink: string;
    roomId: string;
    telephoneDialInNumber: string;
    conferenceId: string;
    conferencePin: string;
    meetingId: string;
  }> {
    try {
      const response = await this.makeRequest(`/v1/events`, 'POST', payload);
      const json = await response.json();
      const roomId = json.room.id;
      const meetingId = json.id;
      const meetingLink = `${config.INSTANCE_URL}/room/${roomId}`;
      const telephoneDialInNumber = json.room.call_in?.tel ?? '',
        conferenceId = json.room.call_in?.id ?? '',
        conferencePin = json.room.call_in?.password ?? '';
      return { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin, meetingId };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async startAdhocMeetingAsModerator(
    meetingTitlePrefix: string
  ): Promise<{ meetingLink: string; roomId: string; meetingId: string }> {
    const payload: object = {
      description: '',
      e2e_encryption: false,
      is_adhoc: true,
      is_time_independent: true,
      title: `${meetingTitlePrefix} ${new Date().toTimeString().slice(0, 5)}`,
      waiting_room: false,
    };

    const { meetingLink, roomId, meetingId } = await this.createMeeting(payload);

    return { meetingLink, roomId, meetingId };
  }

  async getGuestLink(roomId: string): Promise<string> {
    try {
      const getGuestLinkResponse = await this.makeRequest(`/v1/rooms/${roomId}/invites`, 'POST', {});
      const getGuestLinkJson = await getGuestLinkResponse.json();
      const guestLink = `${config.INSTANCE_URL}/room/${roomId}?invite=${getGuestLinkJson.invite_code}`;

      return guestLink;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async planMeetingAsModerator({
    title,
    description = '',
    waiting_room = false,
    show_meeting_details = true,
    password = undefined,
    is_time_independent = false,
    is_adhoc = false,
    has_shared_folder = false,
    streaming_targets = [],
    e2e_encryption = false,
    starts_at = undefined,
    ends_at = undefined,
    timezone = 'Asia/Kathmandu',
    is_all_day = false,
  }: MyFunctionParams): Promise<{
    meetingLink: string;
    roomId: string;
    telephoneDialInNumber: string;
    conferenceId: string;
    conferencePin: string;
    meetingId: string;
  }> {
    const payload = {
      title,
      description: description,
      waiting_room: waiting_room,
      show_meeting_details: show_meeting_details,
      is_time_independent: is_time_independent,
      is_adhoc: is_adhoc,
      has_shared_folder: has_shared_folder,
      streaming_targets: streaming_targets,
      e2e_encryption: e2e_encryption,
      starts_at: starts_at,
      ends_at: ends_at,
      is_all_day: is_all_day,
    };

    if (password !== undefined) {
      (payload as MyFunctionParams).password = password;
    }
    if (!is_time_independent) {
      const now = new Date();
      const starts = new Date(now.getTime() + 5 * 60 * 1000);
      starts_at = {
        datetime: starts.toISOString(),
        timezone: timezone,
      };
      (payload as MyFunctionParams).starts_at = starts_at;
      (payload as MyFunctionParams).ends_at = starts_at;
    }
    const { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin, meetingId } =
      await this.createMeeting(payload);

    return { meetingLink, roomId, telephoneDialInNumber, conferenceId, conferencePin, meetingId };
  }

  async inviteUser(roomId: string, email: string): Promise<void> {
    const response = await this.makeRequest(`/v1/events/${roomId}/invites`, 'POST', { email: email });
    if (![201, 204].includes(response.status)) {
      throw new Error(`Could not invite user. Response code ${response.status}`);
    }
  }

  async acceptInvite(meetingId: string): Promise<void> {
    const response = await this.makeRequest(`/v1/events/${meetingId}/invite`, 'PATCH');
    if (response.status !== 204) {
      throw new Error(`Could not accept invite. Response code ${response.status}`);
    }
  }

  async getUser(searchQuery: string): Promise<User[]> {
    const response = await this.makeRequest(`/v1/users/find?q=${searchQuery}`, 'GET');
    if (response.status !== 200) {
      throw new Error(`Could not find user. Response code ${response.status}`);
    }
    const data: User[] = await response.json();
    return data;
  }

  async getMeetings(): Promise<OpenTalkEvent[]> {
    const users = await this.getUser(this.userName);
    const userId = users[0].id;
    const query = new URLSearchParams({ created_by: userId }).toString();
    const response = await this.makeRequest(`/v1/events?${query}`, 'GET');
    if (!response.ok) {
      throw new Error(`Failed to get meetings. Response code:${response.status}`);
    }
    const meetings: OpenTalkEvent[] = await response.json();
    return meetings;
  }

  async getMeetingByTitle(searchTitle: string): Promise<OpenTalkEvent> {
    const endpoint = `/v1/events`;
    const response = await this.makeRequest(endpoint, 'GET');

    if (!response.ok) {
      throw new Error(`Failed to get meetings: ${response.status}`);
    }

    const result: OpenTalkEvent[] = await response.json();
    const matched = result.find((result) => result.title === searchTitle);
    if (matched) {
      return matched;
    }
    throw new Error(`No meeting found with title ${searchTitle}`);
  }

  async deleteMeetings(): Promise<void> {
    const meetings = await this.getMeetings();
    for (const meeting of meetings) {
      if (meeting.can_edit) {
        const response = await this.makeRequest(`/v1/events/${meeting.id}`, 'DELETE');
        if (response.status !== 204) {
          throw new Error(`Error deleting meeting. Response code: ${response.status}`);
        }
      }
    }
  }
}
