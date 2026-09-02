// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { ModeratorToolsPage } from '../ModeratorToolsPage';

export class TalkingStickPage extends ModeratorToolsPage {
  private readonly startNowButton: Locator;
  public readonly talkingStickStartedNotification: Locator;
  public readonly yourTurnPopup: Locator;
  public readonly dropdownMenuItem: Locator;
  public readonly showPossibleOrderSelectionsButton: Locator;
  public readonly includeModeratorSwitch: Locator;
  public readonly activeSpeakerSVG: Locator;
  private readonly unmuteButton: Locator;
  private readonly nextSpeakerButton: Locator;
  private readonly skipSpeakerButton: Locator;
  private readonly stopButton: Locator;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
    this.talkingStickStartedNotification = this.page.getByText('The Talking Stick is started.', { exact: true });
    this.yourTurnPopup = this.page.getByText("It's your turn now. Please turn on the microphone!", { exact: true });
    this.dropdownMenuItem = this.page
      .getByRole('menu')
      .filter({ has: this.page.getByRole('menuitem', { name: 'Name (A - Z)' }) });
    this.showPossibleOrderSelectionsButton = this.page.locator('[data-sentry-component="TalkingStickSortButton"]');
    this.includeModeratorSwitch = this.page.getByRole('switch', { name: 'Include moderator' });
    this.activeSpeakerSVG = this.page.getByRole('img', { name: 'Active speaker' });
    this.unmuteButton = this.page.getByRole('button', { name: 'Unmute' });
    this.nextSpeakerButton = this.page.getByRole('button', { name: 'Next speaker' });
    this.skipSpeakerButton = this.page.getByRole('button', { name: 'Skip speaker' });
    this.stopButton = this.page.getByRole('button', { name: 'Stop' });
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

  public async getIncludeModeratorSwitchValue(): Promise<boolean> {
    const isValue = await this.includeModeratorSwitch.getAttribute('value');
    return isValue === 'true';
  }

  public async unmute(): Promise<void> {
    await this.unmuteButton.click();
    await this.unmuteButton.waitFor({ state: 'hidden' });
  }

  public async passToNextSpeaker(): Promise<void> {
    await this.nextSpeakerButton.click();
    await this.nextSpeakerButton.waitFor({ state: 'hidden' });
  }

  public async skipSpeaker(): Promise<void> {
    await this.skipSpeakerButton.click();
  }

  public async stopTalkingStick(): Promise<void> {
    await this.stopButton.click();
    await this.stopButton.waitFor({ state: 'hidden' });
  }

  public async isActiveSpeaker(userName: string): Promise<boolean> {
    const userLocator = this.getParticipantByName(userName);
    return (await userLocator.locator(this.activeSpeakerSVG).count()) === 1;
  }
}
