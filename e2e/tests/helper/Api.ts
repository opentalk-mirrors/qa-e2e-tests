// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { readFileSync, readFile } from 'node:fs';

import { config } from '../config';

async function makeRequest(params: string, method: string = 'GET', body?: object, headers: Headers = new Headers()) {
  const dataArray = JSON.parse(readFileSync('.auth/user.json', 'utf-8'));
  headers.append('content-type', 'application/json');
  headers.append('authorization', 'Bearer ' + dataArray.origins[0].localStorage[3].value);
  const bodyString = JSON.stringify(body);

  const requestOptions = {
    headers: headers,
    body: bodyString,
    method: method,
  };

  return fetch(`${process.env.CONTROLLER_HOST}${params}`, requestOptions);
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

export async function createMeeting(payload: object): Promise<{ meetingLink: string; roomId: string }> {
  try {
    const response = await makeRequest(`/v1/events`, 'POST', payload);
    const json = await response.json();
    const roomId = json.room.id;
    const meetingLink = `${config.INSTANCE_URL}/room/${roomId}`;
    return { meetingLink, roomId };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function startAdhocMeetingAsModerator(
  meetingTitlePrefix: string
): Promise<{ meetingLink: string; roomId: string }> {
  const payload: object = {
    description: '',
    e2e_encryption: false,
    is_adhoc: true,
    is_time_independent: true,
    title: `${meetingTitlePrefix} ${new Date().toTimeString().slice(0, 5)}`,
    waiting_room: false,
  };

  const { meetingLink, roomId } = await createMeeting(payload);

  return { meetingLink, roomId };
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
