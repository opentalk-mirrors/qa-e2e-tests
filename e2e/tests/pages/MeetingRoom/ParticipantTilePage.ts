// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator } from '@playwright/test';

export class ParticipantTilePage {
  private readonly participantTile: Locator;
  private readonly handRaisedIndicatorSelector: string;

  constructor({ tileLocator }: { tileLocator: Locator }) {
    this.participantTile = tileLocator;
    this.handRaisedIndicatorSelector = '[data-sentry-component="HandRaisedIndicator"]';
  }

  public async isHandRaised(): Promise<boolean> {
    const indicator = this.participantTile.locator(this.handRaisedIndicatorSelector);
    return await indicator.isVisible();
  }
}
