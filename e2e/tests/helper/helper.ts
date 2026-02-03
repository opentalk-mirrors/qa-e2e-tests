// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DataTable } from '@cucumber/cucumber';

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

export function validateDataTableHeaders(dataTable: DataTable, expectedHeaders: string[]): void {
  const rawData = dataTable.raw();

  if (rawData.length === 0) {
    throw new Error('No data rows found');
  }

  const actualHeaders = rawData[0];
  if (actualHeaders.length !== expectedHeaders.length) {
    throw new Error(`Expected ${expectedHeaders.length} columns, got ${actualHeaders.length}`);
  }

  expectedHeaders.forEach((expected, index) => {
    if (actualHeaders[index] !== expected.trim()) {
      throw new Error(`Column ${index + 1}: expected '${expected}', got '${actualHeaders[index]}'`);
    }
  });
}
