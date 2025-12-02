// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class TalkingStickPage extends ModeratorToolsPage {
  private readonly talkingStickButton: Locator;

  private readonly startNowButton: Locator;
  public readonly talkingStickStartedNotification: Locator;
  public readonly yourTurnPopup: Locator;
  public readonly dropdownMenuItem: Locator;
  public readonly showPossibleOrderSelectionsButton: Locator;
  private readonly participantNameSelector: Locator;
  private readonly participantTimeSelector: Locator;
  public readonly includeModeratorSwitch: Locator;
  public readonly activeSpeakerSVG: Locator;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.talkingStickButton = this.page.getByRole('tab', { name: 'Talking Stick' });
    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
    this.talkingStickStartedNotification = this.page.getByText('The Talking Stick is started.', { exact: true });
    this.yourTurnPopup = this.page.getByText("It's your turn now. Please turn on the microphone!", { exact: true });
    this.dropdownMenuItem = this.page
      .getByRole('menu')
      .filter({ has: this.page.getByRole('menuitem', { name: 'Name (A - Z)' }) });
    this.showPossibleOrderSelectionsButton = this.page.locator('[data-sentry-element="Button"]');
    this.participantNameSelector = this.page.getByRole('listitem').locator('[data-sentry-element="ListItemText"] p');
    this.participantTimeSelector = this.page.getByRole('listitem').locator('[data-sentry-element="ListItemText"] span');
    this.includeModeratorSwitch = this.page.getByRole('switch', { name: 'Include moderator' });
    this.activeSpeakerSVG = this.page.locator('[aria-labelledby="active-speaker-icon-title-id"]');
  }

  public async openTalkingStickPage(): Promise<void> {
    await this.talkingStickButton.click();
  }

  public async startTalkingStick(): Promise<void> {
    await this.startNowButton.click();
  }

  public getOrderSelectionOptionLocator(selectorButton: string): Locator {
    return this.page.getByRole('button', { name: selectorButton, exact: true });
  }

  public async showPossibleOrderSelections(): Promise<void> {
    await this.showPossibleOrderSelectionsButton.click();
  }

  private getOptionMenuLocator(menuItemTitle: string): Locator {
    return this.page.getByRole('menuitem', {
      name: menuItemTitle,
      exact: true,
    });
  }

  public async selectOrderSelection(selectedOrder: string): Promise<void> {
    await this.getOptionMenuLocator(selectedOrder).click();
  }

  public async getParticipantData(childType: 'name' | 'time'): Promise<string[]> {
    let allTexts: string[];
    switch (childType) {
      case 'name':
        allTexts = await this.participantNameSelector.allInnerTexts();
        break;
      case 'time':
        allTexts = await this.participantTimeSelector.allInnerTexts();
        break;
    }
    return allTexts;
  }

  public async getTotalParticipantsNumber(): Promise<number> {
    return (await this.getParticipantData('name')).length;
  }

  public async getIncludeModeratorSwitchValue(): Promise<boolean> {
    const isValue = await this.includeModeratorSwitch.getAttribute('value');
    return isValue === 'true';
  }
}
