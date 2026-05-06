// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

import { config } from '../config';
import { MeetingDetailsPage } from './MeetingDetailsPage';
import { MeetingInvitationPage } from './MeetingInvitationPage';
import { MeetingPlanningPage } from './MeetingPlanningPage';

export class HomePage {
  page: Page;
  planNewMeetingButton: Locator;
  startNewMeetingButton: Locator;
  joinExistingMeetingButton: Locator;
  joinExistingMeetingDialog: Locator;
  joinExistingMeetingHeading: Locator;
  joinExistingMeetingInput: Locator;
  joinExistingMeetingErrorLabel: Locator;
  joinExistingMeetingJoinButton: Locator;
  joinExistingMeetingCloseButton: Locator;
  currentMeetingsHeaderSelector: Locator;
  noFavoritesSelector: Locator;
  favoriteMeetingsHeaderSelector: Locator;
  favoriteMeetingsIcons: Locator;
  startMeetingButtonNamePrefix: string;
  moreOptionsButtonProperties: { role: Parameters<Page['getByRole']>[0]; options: { name: string } };
  detailsMenuItem: Locator;
  editMenuItem: Locator;
  addToFavoriteMenuItem: Locator;
  copyMeetingLinkMenuItem: Locator;
  copyGuestLinkMenuItem: Locator;
  deleteMenuItem: Locator;
  declineMenuItem: Locator;
  acceptMeetingInvitationButton: Locator;
  deleteMenu: Locator;
  deleteButton: Locator;
  private meetingListItem: Locator;
  constructor({ page }: { page: Page }) {
    this.page = page;
    this.planNewMeetingButton = this.page.getByRole('link', { name: 'Plan new' });
    this.startNewMeetingButton = this.page.getByRole('link', { name: /^(Start new|Meeting starten)$/ });
    this.joinExistingMeetingButton = this.page.getByRole('button', { name: 'Join existing' });
    this.joinExistingMeetingDialog = this.page.getByRole('dialog', { name: 'Join a meeting now' });
    this.joinExistingMeetingHeading = this.page.getByRole('heading', { name: 'Join a meeting now' });
    this.joinExistingMeetingInput = this.page.locator('//*[@id="Join meeting input field"]');
    this.joinExistingMeetingErrorLabel = this.page.locator('//*[@id="Join meeting input field-helper-text"]');
    this.joinExistingMeetingJoinButton = this.page.getByRole('button', { name: 'Join' });
    this.joinExistingMeetingCloseButton = this.page.getByRole('button', { name: 'Close dialog' });
    this.currentMeetingsHeaderSelector = this.page.getByText('Current meetings');
    this.noFavoritesSelector = this.page.getByText("You don't have any favorites yet.");
    this.favoriteMeetingsHeaderSelector = this.page.getByText(/^(My favorite meetings|Meine Favoriten)$/);
    this.favoriteMeetingsIcons = this.favoriteMeetingsHeaderSelector.locator('..').locator('svg');
    this.startMeetingButtonNamePrefix = 'Start ';
    this.deleteMenu = this.page.getByRole('menuitem', { name: 'Delete' });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.detailsMenuItem = this.page.getByRole('menuitem', { name: /Details of \w+/ });
    this.editMenuItem = this.page.getByRole('menuitem', { name: /Edit \w+/ });
    this.addToFavoriteMenuItem = this.page.getByRole('menuitem', { name: /Add \w+ to favorites/ });
    this.copyMeetingLinkMenuItem = this.page.getByRole('menuitem', { name: /Copy Meeting-Link for \w+/ });
    this.copyGuestLinkMenuItem = this.page.getByRole('menuitem', { name: /Copy Guest-Link for \w+/ });
    this.deleteMenuItem = this.page.getByRole('menuitem', { name: /Delete \w+/ });
    this.declineMenuItem = this.page.getByRole('menuitem', { name: 'global-decline-label' });
    this.acceptMeetingInvitationButton = this.page.getByRole('button', { name: 'Accept' });
    this.moreOptionsButtonProperties = {
      role: 'button',
      options: { name: 'More Options' },
    };
    this.meetingListItem = this.page.getByRole('listitem');
  }

  async navigateToHomePage(): Promise<void> {
    const eventsTimeMinResponse = this.page.waitForResponse(async (response) => {
      if (
        response.request().url().includes('/v1/events/instances?time_min') &&
        response.request().method() === 'GET' &&
        response.status() === 200
      ) {
        // if the response has some meetings, then also wait till there is at least one
        // meeting rendered on the page
        const meetingCountFromResponse = Object.keys(await response.json()).length;
        if (meetingCountFromResponse > 0) {
          let meetingCountOnPage: number;
          do {
            meetingCountOnPage = await this.page
              .getByRole(this.moreOptionsButtonProperties.role, this.moreOptionsButtonProperties.options)
              .count();
          } while (meetingCountOnPage <= 0);
        }
        return true;
      }
      return false;
    });
    const eventsPerPageResponse = this.page.waitForResponse(
      (response) =>
        response.request().url().includes('/v1/events/instances?per_page') &&
        response.request().method() === 'GET' &&
        response.status() === 200
    );
    const tariffResponse = this.page.waitForResponse(
      (response) =>
        response.request().url().includes('/tariff') &&
        response.request().method() === 'GET' &&
        response.status() === 200
    );
    await this.page.goto(config.INSTANCE_URL);
    await this.page.waitForLoadState('load');
    await Promise.all([eventsTimeMinResponse, eventsPerPageResponse, tariffResponse]);
    // for dashboard page to be fully loaded, favorite meeting box should be rendered fully
    await this.currentMeetingsHeaderSelector.waitFor();
  }

  async planNewMeeting(): Promise<MeetingPlanningPage> {
    await this.planNewMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new MeetingPlanningPage({ page: this.page });
  }

  async startAdhocMeeting(): Promise<MeetingInvitationPage> {
    await this.startNewMeetingButton.click();
    await this.page.waitForLoadState('load');
    return new MeetingInvitationPage({ page: this.page });
  }

  async markMeetingAsFavourite(meetingTitle: string): Promise<void> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.waitFor();
    await meetingMenu.click();
    const ariaLabel = `Add ${meetingTitle} to favorites`;
    await this.page.getByRole('menuitem', { name: ariaLabel }).click();
    const favoriteMeetingSelector = await this.getFavouriteMeetingSelector(meetingTitle);
    await favoriteMeetingSelector.waitFor({ state: 'visible' });
  }

  async getFavouriteMeetingSelector(meetingTitle: string): Promise<Locator> {
    return this.page.getByRole('link', { name: meetingTitle, exact: true });
  }

  public async getStartMeetingButton(meetingTitle: string): Promise<Locator> {
    return this.page.getByRole('link', { name: this.startMeetingButtonNamePrefix + meetingTitle, exact: true }).first();
  }

  async getThreeDotMenuOfMeeting(meetingTitle: string): Promise<Locator> {
    const listWithMeeting = this.page.getByRole('listitem').filter({
      hasText: meetingTitle,
    });

    return listWithMeeting
      .getByRole(this.moreOptionsButtonProperties.role, this.moreOptionsButtonProperties.options)
      .first();
  }

  async getMeetingListItem(meetingTitle: string): Promise<Locator> {
    return this.meetingListItem
      .filter({
        hasText: meetingTitle,
      })
      .filter({
        hasText: `Created by`,
      })
      .first();
  }

  async getAllMeetingListItems(meetingTitle: string): Promise<Array<Locator>> {
    return this.meetingListItem
      .filter({
        hasText: meetingTitle,
      })
      .all();
  }

  async showMoreOptions(meetingTitle: string): Promise<void> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.click();
  }

  async showMeetingDetails(meetingTitle: string): Promise<MeetingDetailsPage> {
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.click();
    await this.detailsMenuItem.click();
    await this.page.waitForLoadState('load');
    return new MeetingDetailsPage({ page: this.page });
  }

  async deleteMeeting(meetingTitle: string): Promise<boolean> {
    const count = await this.getCountOfMeetingsWithTitle(meetingTitle);
    if (count <= 0) {
      // nothing to do
      return false;
    }
    const startMeetingButton = await this.getStartMeetingButton(meetingTitle);
    const meetingLink = await startMeetingButton.getAttribute('href');
    const uniqueMeetingStartButton = this.page.locator(
      '[data-sentry-component="MeetingPopover"] [href*="' + meetingLink + '"]'
    );
    const meetingMenu = await this.getThreeDotMenuOfMeeting(meetingTitle);
    await meetingMenu.waitFor();
    const deleteResponsePromise = this.page.waitForResponse(
      (response) =>
        response.request().url().includes('/events/') &&
        response.request().method() === 'DELETE' &&
        response.status() === 204
    );
    const eventsRefreshedPromise = this.page.waitForResponse(
      (response) =>
        response.request().url().includes('/events?') &&
        response.request().method() === 'GET' &&
        response.status() === 200
    );
    const loadStatePromise = this.page.waitForLoadState('domcontentloaded');
    await meetingMenu.click();
    await this.deleteMenu.click();
    await this.deleteButton.click();
    await Promise.all([deleteResponsePromise, eventsRefreshedPromise, loadStatePromise]);
    let isStartMeetingButtonVisible: boolean;
    do {
      isStartMeetingButtonVisible = await uniqueMeetingStartButton.isVisible();
    } while (isStartMeetingButtonVisible);
    return true;
  }

  private async getCountOfMeetingsWithTitle(meetingTitle: string): Promise<number> {
    const elements = this.page.getByTitle(meetingTitle);
    return await elements.count();
  }

  async navigateToMeetingListFromFavoritesMeetingListIfNoFavoriteMeetings(): Promise<void> {
    await this.noFavoritesSelector.click();
  }

  async openFavoriteMeeting(meetingTitle: string): Promise<void> {
    await (await this.getFavouriteMeetingSelector(meetingTitle)).click();
  }

  async isMeetingFavorite(meetingTitle: string): Promise<boolean> {
    const meeting = await this.getMeetingListItem(meetingTitle);
    return (await meeting.locator('svg').count()) === 2;
  }
}
