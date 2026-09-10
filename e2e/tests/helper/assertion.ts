// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { expect, Locator, Response } from '@playwright/test';

const ASSERTIONS_WITH_EXPECTED = [
  'toBe',
  'toMatch',
  'toContain',
  'toEqual',
  'toHaveText',
  'toContainText',
  'toHaveProperty',
  'toHaveValue',
  'toHaveCount',
] as const;

type AssertionsWithExpected = (typeof ASSERTIONS_WITH_EXPECTED)[number];

type AssertionsWithoutExpected =
  | 'toBeVisible'
  | 'not toBeVisible'
  | 'toBeChecked'
  | 'not toBeChecked'
  | 'toBeTruthy'
  | 'toBeFalsy'
  | 'toBeUndefined'
  | 'toBeEnabled'
  | 'toBeFocused'
  | 'toBeHidden';

type AssertionType = AssertionsWithExpected | AssertionsWithoutExpected;

type AssertionActual =
  | string
  | number
  | Locator
  | boolean
  | string[]
  | Response
  | Record<string, string>
  | undefined
  | null
  | object;

type ExpectedValue = string | number | boolean | string[] | RegExp | object;

// Assertions that require an expected value.
export function assert(
  actual: AssertionActual,
  assertionType: AssertionsWithExpected,
  expected: ExpectedValue,
  message: string
): Promise<void>;

// Assertions that do not require an expected value.
export function assert(
  actual: AssertionActual,
  assertionType: AssertionsWithoutExpected,
  message: string
): Promise<void>;

export async function assert(
  actual: AssertionActual,
  assertionType: AssertionType,
  expectedOrMessage?: ExpectedValue | string,
  message?: string
): Promise<void> {
  const isWithExpected = ASSERTIONS_WITH_EXPECTED.includes(assertionType as AssertionsWithExpected);

  const expected = isWithExpected ? expectedOrMessage : undefined;
  const assertionMessage = isWithExpected
    ? (message ?? `${assertionType} assertion failed`)
    : ((expectedOrMessage as string | undefined) ?? `${assertionType} assertion failed`);

  try {
    switch (assertionType) {
      case 'toBe':
        expect(actual, assertionMessage).toBe(expected);
        break;
      case 'toMatch':
        if (typeof actual !== 'string') {
          throw new TypeError('actual must be a string');
        }
        if (typeof expected !== 'string' && !(expected instanceof RegExp)) {
          throw new TypeError('expected must be a string or RegExp');
        }
        await expect(actual, assertionMessage).toMatch(expected);
        break;
      case 'toBeVisible':
        await expect(actual as Locator, assertionMessage).toBeVisible();
        break;
      case 'not toBeVisible':
        await expect(actual as Locator, assertionMessage).not.toBeVisible();
        break;
      case 'toBeChecked':
        await expect(actual as Locator, assertionMessage).toBeChecked();
        break;
      case 'not toBeChecked':
        await expect(actual as Locator, assertionMessage).not.toBeChecked();
        break;
      case 'toContain':
        if (Array.isArray(actual)) {
          expect(actual as string[], assertionMessage).toContain(expected);
        } else {
          expect(actual as string, assertionMessage).toContain(expected);
        }
        break;
      case 'toEqual':
        expect(actual as string[] | object, assertionMessage).toEqual(expected);
        break;
      case 'toBeTruthy':
        expect(actual, assertionMessage).toBeTruthy();
        break;
      case 'toBeFalsy':
        expect(actual, assertionMessage).toBeFalsy();
        break;
      case 'toBeUndefined':
        expect(actual, assertionMessage).toBeUndefined();
        break;
      case 'toContainText':
        await expect(actual as Locator, assertionMessage).toContainText(expected as string);
        break;
      case 'toBeEnabled':
        await expect(actual as Locator, assertionMessage).toBeEnabled();
        break;
      case 'toHaveProperty':
        expect(actual as Record<string, unknown>, assertionMessage).toHaveProperty(expected as string);
        break;
      case 'toHaveValue':
        await expect(actual as Locator, assertionMessage).toHaveValue(expected as string);
        break;
      case 'toHaveText':
        await expect(actual as Locator, assertionMessage).toHaveText(expected as string);
        break;
      case 'toHaveCount':
        await expect(actual as Locator, assertionMessage).toHaveCount(expected as number);
        break;
      case 'toBeHidden':
        await expect(actual as Locator, assertionMessage).toBeHidden();
        break;
      case 'toBeFocused':
        await expect(actual as Locator, assertionMessage).toBeFocused();
        break;
      default:
        throw new Error(`'${assertionType}' is not implemented`);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new TypeError(e.message);
    }
    throw new Error(assertionMessage + '\n' + e);
  }
}
