// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator, Response } from '@playwright/test';

type AssertionType =
  | 'toBe'
  | 'toMatch'
  | 'toBeVisible'
  | 'toBeChecked'
  | 'toContain'
  | 'not toBeChecked'
  | 'not toBeVisible'
  | 'toEqual'
  | 'toBeTruthy'
  | 'toBeFalsy'
  | 'toBeUndefined'
  | 'toHaveText'
  | 'toContainText'
  | 'toBeEnabled'
  | 'toHaveProperty'
  | 'toHaveValue';
export async function assert(
  actual:
    | string
    | number
    | Locator
    | boolean
    | string[]
    | Response
    | Record<string, string>
    | undefined
    | null
    | object,
  assertionType: AssertionType,
  expected?: string | number | boolean | string[] | RegExp | object,
  message?: string
) {
  try {
    switch (assertionType) {
      case 'toBe':
        expect(actual, message).toBe(expected);
        break;
      case 'toMatch':
        if (typeof actual !== 'string') {
          throw new TypeError('actual must be a string');
        }
        if (typeof expected !== 'string' && !(expected instanceof RegExp)) {
          throw new TypeError('expected must be a string or RegExp');
        }
        await expect(actual, message).toMatch(expected);
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
      case 'toEqual':
        expect(actual as string[] | object, message).toEqual(expected);
        break;
      case 'toBeTruthy':
        expect(actual, message).toBeTruthy();
        break;
      case 'toBeFalsy':
        expect(actual, message).toBeFalsy();
        break;
      case 'toBeUndefined':
        expect(actual, message).toBeUndefined();
        break;
      case 'toContainText':
        await expect(actual as Locator, message).toContainText(expected as string);
        break;
      case 'toBeEnabled':
        await expect(actual as Locator, message).toBeEnabled();
        break;
      case 'toHaveProperty':
        expect(actual as Record<string, string>, message).toHaveProperty(expected as string);
        break;
      case 'toHaveValue':
        await expect(actual as Locator, message).toHaveValue(expected as string);
        break;
      case 'toHaveText':
        await expect(actual as Locator, message).toHaveText(expected as string);
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
