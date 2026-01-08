// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export function isTimeAscending(times: string[]): boolean {
  for (let i = 1; i < times.length; i++) {
    if (timeToMinutes(times[i]) < timeToMinutes(times[i - 1])) {
      return false;
    }
  }
  return true;
}

export function isTimeDescending(times: string[]): boolean {
  for (let i = 1; i < times.length; i++) {
    if (timeToMinutes(times[i]) > timeToMinutes(times[i - 1])) {
      return false;
    }
  }
  return true;
}
