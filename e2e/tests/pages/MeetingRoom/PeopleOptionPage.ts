// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { ModeratorToolsPage } from './ModeratorToolsPage';

export class PeopleOptionPage extends ModeratorToolsPage {
  public readonly page: Page;
  public readonly searchParticipantTextbox: Locator;
  public readonly sortByButton: Locator;
  public readonly withoutGroupButton: Locator;
  public readonly withoutGroupExpandButton: Locator;
  public readonly participantsList: Locator;
  public readonly participantDetail: Locator;
  public readonly participantName: Locator;
  public readonly participantTime: Locator;
  public readonly participantAvatar: Locator;
  public readonly guestLabel: Locator;
  public readonly microphonesStatus: Locator;
  public readonly sortByDropdown: Locator;

  constructor({ page }: { page: Page }) {
    super({ page: page });
    this.page = page;
    this.searchParticipantTextbox = this.page.getByRole('textbox', { name: 'Search participant' });
    this.sortByButton = this.page.getByRole('button', { name: 'Sort by' });
    this.withoutGroupButton = this.page.getByRole('button', { name: 'without group' });
    this.withoutGroupExpandButton = this.page.getByRole('button', { name: 'without group' }).locator('svg');
    this.participantsList = this.page.getByRole('tabpanel', { name: 'People' }).getByRole('list');
    this.participantDetail = this.page.getByRole('tabpanel', { name: 'People' }).getByRole('listitem');
    this.participantName = this.page.getByRole('tabpanel', { name: 'People' }).getByRole('list').locator('p');
    this.participantTime = this.page.locator('//*[@data-sentry-element="ListItemText"]').locator('span');
    this.participantAvatar = this.page.getByRole('listitem').getByTestId('participantAvatar');
    this.guestLabel = this.page.getByRole('listitem').getByText('Guest');
    this.microphonesStatus = this.page.getByRole('img', { name: /^(Microphone is on|Microphone is off)$/ });
    this.sortByDropdown = this.page
      .getByRole('menu')
      .filter({ has: this.page.getByRole('menuitem', { name: 'Name (A - Z)' }) });
  }

  public async getNumberOfParticipants(): Promise<number> {
    await waitForDomStopChanging(this.page);
    return (await this.participantDetail.all()).length;
  }

  public async getParticipantDetails(index: number): Promise<string> {
    await waitForDomStopChanging(this.page);
    return (await this.participantDetail.nth(index)).innerText();
  }

  public async getAllParticipantsNames(): Promise<string[]> {
    await waitForDomStopChanging(this.page);
    const participantsName: string[] = [];
    for (const participant of await this.participantName.all()) {
      participantsName.push(await participant.innerText());
    }
    return participantsName;
  }

  public async getAllParticipantsTimes(text: 'Joined' | 'Last Active' | 'Hand raised'): Promise<string[]> {
    await waitForDomStopChanging(this.page);
    const participantsTime: string[] = [];
    for (const participant of await this.participantTime.filter({ hasText: text }).all()) {
      participantsTime.push(await participant.innerText());
    }
    return participantsTime.map((text) => text.split(' ')[2] ?? text.split(' ')[1]);
  }

  public async getAllParticipantsDetails(): Promise<string[]> {
    const participantsTexts = [];
    for (const participant of await this.participantDetail.all()) {
      participantsTexts.push(await participant.innerText());
    }
    return participantsTexts;
  }

  public async selectSearchParticipant(): Promise<void> {
    await this.searchParticipantTextbox.click();
  }

  public async getSearchParticipantPlaceholder(): Promise<string> {
    return (await this.searchParticipantTextbox.getAttribute('placeholder')) ?? '';
  }

  public async typeInSearchParticipantTextbox(searchText: string): Promise<void> {
    await this.searchParticipantTextbox.fill(searchText);
  }

  public async clearTextInSearchParticipantTextbox(): Promise<void> {
    await this.searchParticipantTextbox.clear();
  }

  public async getSearchParticipantTextboxValue(): Promise<string> {
    return await this.searchParticipantTextbox.inputValue();
  }

  public async showPossibleOrderSelections(): Promise<void> {
    await this.sortByButton.click();
    await this.sortByDropdown.waitFor({ state: 'visible' });
  }

  private getSortOptionLocator(sortOption: string): Locator {
    return this.page.getByRole('menuitem', {
      name: sortOption,
      exact: true,
    });
  }

  public async sortParticipants(selectedOrder: string): Promise<void> {
    if (!(await this.sortByDropdown.isVisible())) {
      await this.showPossibleOrderSelections();
    }

    await this.getSortOptionLocator(selectedOrder).click();
    await this.page.keyboard.press('Escape');
  }

  public async toggleWithoutGroup(): Promise<void> {
    await this.withoutGroupButton.click();
  }

  public async isGuest(name: string): Promise<boolean> {
    const guest = (await this.getAllParticipantsDetails()).filter((guest) => guest.includes(name))[0];
    return guest.includes('Guest');
  }
}
