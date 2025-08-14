// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { readFileSync, readFile } from 'node:fs';

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
