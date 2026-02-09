// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator } from '@playwright/test';

export function assert(
  actual: string | number | Locator,
  assertionType: 'toBe' | 'toMatch',
  expected: string | number,
  message?: string
) {
  try {
    switch (assertionType) {
      case 'toBe':
        expect(actual, message).toBe(expected);
        break;
      case 'toMatch':
        if (typeof actual !== 'string' || typeof expected !== 'string') {
          throw new TypeError('actual and expected must be a string');
        }
        expect(actual, message).toMatch(new RegExp(expected));
        break;
      default:
        throw new Error(`'${assertionType}' is not implemented`);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new TypeError(e.message);
    }
    throw new Error(message + '\n' + e);
  }
}
