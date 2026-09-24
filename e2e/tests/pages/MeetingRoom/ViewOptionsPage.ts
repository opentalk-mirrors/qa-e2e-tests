// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class ViewOptionsPage {
  private readonly page: Page;

  public readonly viewOptionsButton: Locator;
  public readonly viewGridAndSortingPopup: Locator;
  public readonly gridViewOption: Locator;
  public readonly speakerViewOption: Locator;
  public readonly fullScreenViewOption: Locator;
  public readonly fullScreenView: Locator;
  private readonly closeFullScreenButton: Locator;
  public activitySortingOption: Locator;
  public joinTimeFirstSortingOption: Locator;
  public activatedCameraFirstSortingOption: Locator;
  public moderatorsFirstSortingOption: Locator;
  public readonly gridViewParticipantWindow: Locator;
  private readonly speakerViewContainer: Locator;
  private readonly viewOptions: Locator;
  private readonly gridSizeOptions: Locator;
  private readonly sortingDropdown: Locator;

  public readonly selectors = {
    speakerViewContainer: 'SpeakerView-Container',
    speakerViewParticipantsThumbsHolder: 'ThumbsHolder',
    speakerWindow: 'SpeakerWindow1',
    participantWindow: 'ParticipantWindow',
    participantName: 'nameTile',
    fullScreen: 'fullscreen',
  };

  public readonly videoPreviewName: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;

    this.viewOptionsButton = this.page.getByRole('button', { name: 'Customize view' });
    this.viewGridAndSortingPopup = this.page.getByRole('dialog', { name: 'Customize view' });
    this.viewOptions = this.page.getByRole('group', { name: 'View' });
    this.gridSizeOptions = this.page.getByRole('group', { name: 'Grid size' });
    this.sortingDropdown = this.page.getByRole('combobox', { name: 'Sort by' });
    this.gridViewOption = this.viewGridAndSortingPopup.getByRole('button', { name: 'Grid' });
    this.speakerViewOption = this.viewGridAndSortingPopup.getByRole('button', { name: 'Speaker' });
    this.fullScreenViewOption = this.viewGridAndSortingPopup.getByRole('button', { name: 'Fullscreen' });
    this.fullScreenView = this.page.getByTestId(this.selectors.fullScreen);
    this.closeFullScreenButton = this.page.getByTestId(this.selectors.fullScreen).getByLabel('close fullscreen');
    this.activitySortingOption = this.page.getByRole('option', {
      name: 'Activity',
    });
    this.joinTimeFirstSortingOption = this.page.getByRole('option', {
      name: 'Join time',
    });
    this.activatedCameraFirstSortingOption = this.page.getByRole('option', {
      name: 'Camera status',
    });
    this.moderatorsFirstSortingOption = this.page.getByRole('option', {
      name: 'Role',
    });
    this.gridViewParticipantWindow = this.page.getByTestId(this.selectors.participantWindow);
    this.speakerViewContainer = this.page.getByTestId(this.selectors.speakerViewContainer);

    this.videoPreviewName = this.page
      .getByRole('complementary', { name: 'Tools' })
      .getByTestId(this.selectors.participantName);
  }

  public async displayViewOptionsMenu(): Promise<void> {
    await this.viewOptionsButton.waitFor();
    await this.viewOptionsButton.click();
    await this.viewGridAndSortingPopup.waitFor();
    await this.viewGridAndSortingPopup.isVisible();
  }

  public async getViewOptionsListText(): Promise<string[]> {
    const optionsText: string[] = [];
    for (const item of await this.getViewOptionsList()) {
      optionsText.push(await item.innerText());
    }
    return optionsText;
  }

  public async getViewOptionsList(): Promise<Array<Locator>> {
    return await this.viewOptions.getByRole('button').all();
  }

  public async getGridSizeOptionsListText(): Promise<string[]> {
    const optionsText: string[] = [];
    for (const item of await this.getGridSizeOptionsList()) {
      optionsText.push(await item.innerText());
    }
    return optionsText;
  }

  public async getGridSizeOptionsList(): Promise<Array<Locator>> {
    return await this.gridSizeOptions.getByRole('button').all();
  }

  public async selectGridViewOption(): Promise<void> {
    await this.gridViewOption.waitFor();
    await this.gridViewOption.click();
  }

  public async selectSpeakerViewOption(): Promise<void> {
    await this.speakerViewOption.waitFor();
    await this.speakerViewOption.click();
  }

  public async selectFullScreenViewOption(): Promise<void> {
    await this.fullScreenViewOption.waitFor();
    await this.fullScreenViewOption.click();
    await this.page.waitForLoadState();
    await this.page.waitForTimeout(1000); // it seems like there is some lag, without timeout this seems to make CI fail
    await this.fullScreenView.isVisible();
  }

  public async selectActivitySortingOption(): Promise<void> {
    await this.sortingDropdown.click();
    await this.activitySortingOption.waitFor();
    await this.activitySortingOption.click();
  }

  public async selectActivatedCameraFirstSortingOption(): Promise<void> {
    await this.sortingDropdown.click();
    await this.activatedCameraFirstSortingOption.waitFor();
    await this.activatedCameraFirstSortingOption.click();
  }

  public async selectModeratorsFirstSortingOption(): Promise<void> {
    await this.sortingDropdown.click();
    await this.moderatorsFirstSortingOption.waitFor();
    await this.moderatorsFirstSortingOption.click();
  }

  public async selectJoinTimeFirstSortingOption(): Promise<void> {
    await this.sortingDropdown.click();
    await this.joinTimeFirstSortingOption.waitFor();
    await this.joinTimeFirstSortingOption.click();
  }

  public async isFullScreen(): Promise<boolean> {
    return await this.fullScreenView.isVisible();
  }

  public async closeFullScreenMode(): Promise<void> {
    await this.closeFullScreenButton.isVisible();
    await this.closeFullScreenButton.click();
    await this.closeFullScreenButton.isHidden();
    await this.fullScreenView.isHidden();
    await this.page.waitForTimeout(1000);
  }

  //functions (related to how participants are displayed)
  public async pinNthParticipantInSpeakerView(participantName: string): Promise<string> {
    const participantsThumbs = this.page.getByTestId(this.selectors.speakerViewParticipantsThumbsHolder);
    const nthParticipantWindow = participantsThumbs
      .getByTestId(this.selectors.participantWindow)
      .filter({ hasText: participantName });
    // after participant gets pinned, it gets to top and order is changed, so storing the participant to be pinned before pinning
    const pinnedParticipant = await this.getNameTileText(nthParticipantWindow);
    await nthParticipantWindow.click();
    return pinnedParticipant;
  }

  public async getPinnedParticipantNameInSpeakerView(): Promise<string> {
    const speakerWindow = this.page.getByTestId(this.selectors.participantWindow).first();
    return await this.getNameTileText(speakerWindow);
  }

  public async getFirstParticipantNameInSpeakerView(): Promise<string> {
    const participantWindow = this.page
      .getByTestId(this.selectors.speakerViewContainer)
      .getByTestId(this.selectors.participantWindow)
      .first();
    return await this.getNameTileText(participantWindow);
  }

  public async getThumbsNthParticipantNameInSpeakerView(nth: number): Promise<string> {
    const participantWindow = this.page
      .getByTestId(this.selectors.speakerViewParticipantsThumbsHolder)
      .getByTestId(this.selectors.participantWindow)
      .nth(nth - 1); // minus 1 because nth(0) is the first element
    return (await this.getNameTileText(participantWindow)).trim();
  }

  public async getNthParticipantNameInGridView(nth: number): Promise<string> {
    const participantWindow = this.page.getByTestId(this.selectors.participantWindow).nth(nth - 1); // minus 1 because nth(0) is the first element
    return await this.getNameTileText(participantWindow);
  }

  public async getNumberOfParticipantWindowsInGridView(): Promise<number> {
    const participantWindows = await this.page.getByTestId(this.selectors.participantWindow).all();
    return participantWindows.length;
  }

  public async getNameTileText(participantWindow: Locator): Promise<string> {
    const nameTile = participantWindow.getByTestId(this.selectors.participantName);
    let nameTileText = '';
    if (await nameTile.isVisible()) {
      nameTileText = await nameTile.innerText();
    }
    return nameTileText;
  }

  public async isGridViewNthParticipantCameraOn(nth: number): Promise<boolean> {
    const isGridViewParticipantCameraOn = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .locator('video');
    return await isGridViewParticipantCameraOn.isVisible();
  }

  public async getGridViewNthParticipantWindowAlignment(nth: number): Promise<string> {
    const gridViewParticipantWindowAlignment = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('align-items');
      });
    return gridViewParticipantWindowAlignment;
  }

  public async getGridViewNthParticipantWindowSize(nth: number): Promise<number> {
    const gridViewParticipantWindowSize = await this.gridViewParticipantWindow
      .nth(nth - 1) // minus 1 because nth(0) is the first
      .evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('width'); // only evaluating width, same could be done with height
      });
    return Math.floor(+gridViewParticipantWindowSize);
  }

  public async closeViewOptionsMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }
}
