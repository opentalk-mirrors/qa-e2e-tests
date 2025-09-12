// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { meetingUrlPatter } from './meetingHelpers';

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// returns the substituted string or if no substitution is found, the string itself
export function substituteInLineCodes(code: string): string {
  switch (code) {
    case '%meeting_url_pattern%':
      return meetingUrlPatter;
    default:
      return code;
  }
}
