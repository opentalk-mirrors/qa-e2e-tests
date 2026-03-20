// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator } from '@playwright/test';

type AssertionType =
  | 'toBe'
  | 'toMatch'
  | 'toBeVisible'
  | 'toBeChecked'
  | 'toContain'
  | 'not toBeChecked'
  | 'not toBeVisible';
export async function assert(
  actual: string | number | Locator | boolean | string[],
  assertionType: AssertionType,
  expected?: string | number | boolean,
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
      case 'toBeVisible':
        await expect(actual as Locator, message).toBeVisible();
        break;
      case 'not toBeVisible':
        await expect(actual as Locator, message).not.toBeVisible();
        break;
      case 'toBeChecked':
        await expect(actual as Locator, message).toBeChecked();
        break;
      case 'not toBeChecked':
        await expect(actual as Locator, message).not.toBeChecked();
        break;
      case 'toContain':
        if (Array.isArray(actual)) {
          expect(actual as string[], message).toContain(expected);
        } else {
          expect(actual as string, message).toContain(expected);
        }
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
