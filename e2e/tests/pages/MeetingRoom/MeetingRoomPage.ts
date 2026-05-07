// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator, BrowserContext, expect } from '@playwright/test';

import { config } from '../../config';
import { waitForDomStopChanging } from '../../helper/waitingHelpers';
import { BurgerMenuPage } from './BurgerMenuPage';
import { MeetingInfoPage } from './MeetingInfoPage';
import { BreakoutRoomsPage } from './ModeratorTools/BreakoutRoomsPage';
import { CoffeeBreakPage } from './ModeratorTools/CoffeeBreakPage';
import { MuteParticipantsPage } from './ModeratorTools/MuteParticipantsPage';
import { PollPage } from './ModeratorTools/PollPage';
import { ResetRaisedHandsPage } from './ModeratorTools/ResetRaisedHandsPage';
import { TalkingStickPage } from './ModeratorTools/TalkingStickPage';
import { TimerPage } from './ModeratorTools/TimerPage';
import { VotingRoomPage } from './ModeratorTools/VotingRoomPage';
import { MoreOptionsPage } from './MoreOptionsPage';
import { ParticipantTilePage } from './ParticipantTilePage';
import { PeopleOptionPage } from './PeopleOptionPage';
import { ViewOptionsPage } from './ViewOptionsPage';

export class MeetingRoomPage {
  page: Page;
  context: BrowserContext;

  meetingRoomName: Locator;

  meetingInfoButton: Locator;

  public readonly viewOptionsButton: Locator;
  private readonly waitingListButton: Locator;
  private readonly waitingParticipantsIndicator: Locator;
  private readonly waitingParticipants: Locator;

  public readonly participantWindowLocator: Locator;

  jumpLinks: {
    skipToModerationPanelLink: Locator;
    skipToMyMeetingMenuLink: Locator;
    skipToPersonalControlPanelLink: Locator;
  };

  moderationTools: {
    homeButton: Locator;
    muteParticipantsButton: Locator;
    resetRaisedHandsButton: Locator;
    talkingStickButton: Locator;
    pollButton: Locator;
    votingButton: Locator;
    meetingNotesButton: Locator;
    whiteboardButton: Locator;
    createBreakoutRoomsButton: Locator;
    timerButton: Locator;
    coffeeBreakButton: Locator;
    debriefingButton: Locator;
    createVotingRoomsButton: Locator;
  };

  videoPreview: Locator;
  videoPreviewName: Locator;
  videoFullScreenButton: Locator;
  videoFullScreenExitButton: Locator;

  toolBar: {
    toolBarPanel: Locator;
    handRaiseButton: Locator;
    handLowerButton: Locator;
    turnOnScreenShareButton: Locator;
    microphoneButton: Locator;
    microphoneButtonOff: Locator;
    microphoneMoreOptionsMenuButton: Locator;
    videoButton: Locator;
    videoButtonOff: Locator;
    cameraMoreOptionButton: Locator;
    moreOptionButton: Locator;
    endMeetingButton: Locator;
  };

  participantsAvatar: {
    moderatorAvatar: Locator;
    guestAvatar: Locator;
  };

  chatButton: Locator;
  peopleButton: Locator;
  messagesButton: Locator;

  chatOption: Locator;
  searchInChatButton: Locator;
  private readonly closeSearchInChatButton: Locator;
  public readonly chatHistoryDescription: Locator;
  public readonly joinedText: Locator;
  private readonly chatListItems: Locator;
  public readonly noMessageMatchText: Locator;
  public readonly resetButton: Locator;
  emojiPicker: Locator;
  public readonly emojiPickerDialog: Locator;
  private readonly smileyEmojiButton: Locator;
  chatTextField: Locator;
  public readonly chatTextArea: Locator;
  private readonly chatTextbox: Locator;
  chatSubmitButton: Locator;
  emptyMessageError: Locator;
  securityMonitorButton: Locator;

  burgerMenuButton: Locator;

  reportABug: {
    manualGlitchtipPopup: Locator;
  };

  keyboardShortcuts: {
    shortcutSettingsPopup: Locator;
    checkbox: Locator;
  };
  private closePopupDialogButton: Locator;
  private isKeyboardShortcutOn: boolean = true;

  coffeeBreakDialog: {
    coffeeBreakPopover: Locator;
    coffeeBreakIcon: Locator;
    durationLabel: Locator;
    timerText: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.context = this.page.context();

    this.meetingRoomName = this.page.locator('h1').first();

    this.meetingInfoButton = this.page.getByRole('button', { name: 'Share meeting details' });

    this.viewOptionsButton = this.page.getByRole('button', { name: 'Select view' });
    this.waitingListButton = this.page.getByTestId('waiting-list-button');
    this.waitingParticipantsIndicator = this.page
      .locator('//*[@data-sentry-component="WaitingParticipantsPopover"]')
      .locator('span');
    this.waitingParticipants = this.page.locator('//*[@data-sentry-element="ScrollableBox"]');

    this.participantWindowLocator = this.page.getByTestId('ParticipantWindow');

    this.jumpLinks = {
      skipToModerationPanelLink: this.page.getByRole('link', { name: 'Skip to Moderation panel' }),
      skipToMyMeetingMenuLink: this.page.getByRole('link', { name: 'Skip to My meeting menu' }),
      skipToPersonalControlPanelLink: this.page.getByRole('link', { name: 'Skip to Personal control panel' }),
    };

    this.moderationTools = {
      homeButton: this.page.getByRole('tab', { name: 'Home' }),
      muteParticipantsButton: this.page.getByRole('tab', { name: 'Mute participants' }),
      resetRaisedHandsButton: this.page.getByRole('tab', { name: 'Reset raised hands' }),
      talkingStickButton: this.page.getByRole('tab', { name: 'Talking stick' }),
      pollButton: this.page.getByRole('tab', { name: 'Poll' }),
      votingButton: this.page.getByRole('tab', { name: 'Voting' }),
      meetingNotesButton: this.page.getByRole('tab', { name: 'Meeting notes' }),
      whiteboardButton: this.page.getByRole('tab', { name: 'Whiteboard' }),
      createBreakoutRoomsButton: this.page.getByRole('tab', { name: 'Create breakout rooms' }),
      timerButton: this.page.getByRole('tab', { name: 'Timer' }),
      coffeeBreakButton: this.page.getByRole('tab', { name: 'Coffee break' }),
      debriefingButton: this.page.getByRole('tab', { name: 'Debriefing' }),
      createVotingRoomsButton: this.page.getByRole('tab', { name: 'Voting' }),
    };

    this.videoPreview = this.page.getByRole('complementary', { name: 'Tools' }).locator('video');
    // video container that is nested inside 'aside' tag --> complementary is the role of the aside, see https://www.w3.org/TR/html-aria/#docconformance

    this.videoPreviewName = this.page.getByRole('complementary', { name: 'Tools' }).getByTestId('nameTile');
    this.videoFullScreenButton = this.page.getByRole('button', { name: 'open fullscreen' });
    this.videoFullScreenExitButton = this.page.getByRole('button', { name: 'close fullscreen' });

    this.toolBar = {
      toolBarPanel: this.page.getByTestId('fullscreen').getByLabel('Personal control panel'),
      handRaiseButton: this.page.getByRole('button', { name: 'Raise Your Hand' }),
      handLowerButton: this.page.getByRole('button', { name: 'Lower Your Hand' }),
      turnOnScreenShareButton: this.page.getByRole('button', { name: 'Turn On Screen Share' }),
      microphoneButton: this.page.getByRole('button', { name: 'Turn On Audio', exact: true }),
      microphoneButtonOff: this.page.getByRole('button', { name: 'Turn Off Audio', exact: true }),
      microphoneMoreOptionsMenuButton: this.page.getByRole('button', { name: 'additional options microphone' }),
      videoButton: this.page.getByRole('button', { name: 'Turn On Video', exact: true }),
      videoButtonOff: this.page.getByRole('button', { name: 'Turn Off Video', exact: true }),
      cameraMoreOptionButton: this.page.getByRole('button', { name: 'additional options camera' }),
      moreOptionButton: this.page.getByRole('button', { name: 'More Options' }),
      endMeetingButton: this.page.getByRole('button', { name: 'Leave Call' }),
    };

    this.participantsAvatar = {
      moderatorAvatar: this.page.locator('.MuiBadge-badge:has(svg title:has-text("Moderator"))'),
      guestAvatar: this.page.locator('.MuiBadge-badge:not(:has(svg title:has-text("Moderator")))'),
    };

    this.chatButton = this.page.getByRole('tab', { name: 'Chat' });
    this.peopleButton = this.page.getByRole('tab', { name: 'People' });
    this.messagesButton = this.page.getByRole('tab', { name: 'Messages' });

    this.chatOption = this.page.getByTestId('chat');
    this.searchInChatButton = this.page.getByRole('textbox', { name: 'Search in chat' });
    this.closeSearchInChatButton = this.page.getByRole('button', { name: 'Clear' });
    this.chatHistoryDescription = this.page.getByRole('tabpanel', { name: 'Chat' }).getByRole('paragraph');
    this.joinedText = this.page.locator('//*[@data-testid="user-event-message"]');
    this.chatListItems = this.page.getByRole('tabpanel', { name: 'Chat' }).getByRole('listitem');
    this.noMessageMatchText = this.page
      .getByRole('tabpanel', { name: 'Chat' })
      .getByText('No messages matching the criteria');
    this.resetButton = this.page.getByRole('button', { name: 'Reset' });
    this.emojiPicker = this.page.getByRole('button', { name: 'open emoji picker' });
    this.chatTextField = this.page.getByPlaceholder('Type a message');
    this.emojiPickerDialog = this.page.getByRole('dialog', { name: 'Emoji picker' });
    this.smileyEmojiButton = this.page.getByRole('button', { name: 'smiley', exact: true });

    this.chatTextArea = this.page.locator('//*[@id="chat-input-label"]');
    this.chatTextbox = this.page.getByRole('textbox', { name: 'Chat', exact: true });
    this.chatSubmitButton = this.page.getByRole('button', { name: 'submit chat message' });
    this.emptyMessageError = this.page.getByText('Chatopen emoji').getByRole('paragraph');

    this.securityMonitorButton = this.page.getByRole('button', { name: 'Show security monitor' });

    this.burgerMenuButton = this.page.getByRole('button', { name: 'My meeting', exact: true });

    this.reportABug = {
      manualGlitchtipPopup: this.page.getByRole('dialog', { name: "Oh, it looks like we're having issues." }),
    };

    this.keyboardShortcuts = {
      shortcutSettingsPopup: this.page.getByRole('dialog', { name: 'Shortcut Settings' }),
      checkbox: this.page.getByRole('switch', { name: 'Activate shortcuts' }),
    };
    this.closePopupDialogButton = this.page.getByRole('button', { name: 'Close dialog' });

    const coffeeBreakPopover = this.page.getByRole('alert', { name: 'Coffee break ...' });
    this.coffeeBreakDialog = {
      coffeeBreakPopover: coffeeBreakPopover,
      coffeeBreakIcon: coffeeBreakPopover.locator('svg').nth(0),
      durationLabel: coffeeBreakPopover.locator('#tabpanel-tab-coffee-break p').first(),
      timerText: coffeeBreakPopover.getByTestId('timer-display'),
    };
  }

  async renderMeetingRoom(): Promise<void> {
    await this.page.waitForLoadState();
    await this.meetingRoomName.waitFor({ state: 'visible' });
  }

  async getMeetingRoomName(): Promise<string> {
    await this.meetingRoomName.waitFor();
    const text = await this.meetingRoomName.getAttribute('title');
    if (text === null) {
      throw new Error('Meeting room name not found');
    }
    return text;
  }

  async getUserName(): Promise<string> {
    let userName = '';
    // user name is only visible if camera is turned on
    const initialCameraStatus = await this.isCameraOn();
    if (!initialCameraStatus) {
      await this.turnCameraOn();
    }
    if (await this.videoPreviewName.isVisible()) {
      userName = await this.videoPreviewName.innerText();
    }
    if (!initialCameraStatus) {
      // reset to initial camera status
      await this.turnCameraOff();
    }
    return userName;
  }

  async showMeetingDetails(): Promise<MeetingInfoPage> {
    await this.meetingInfoButton.click();
    const meetingInfoPage = new MeetingInfoPage({ page: this.page });
    await meetingInfoPage.clipBoardButton.waitFor();
    return meetingInfoPage;
  }

  // toolbar functions

  public async raiseYourHand(): Promise<void> {
    await this.toolBar.handRaiseButton.click();
    await this.toolBar.handLowerButton.waitFor();
  }

  public async lowerYourHand(): Promise<void> {
    await this.toolBar.handLowerButton.click();
    await this.toolBar.handRaiseButton.waitFor();
  }

  public async isHandRaised(): Promise<boolean> {
    return await this.toolBar.handLowerButton.isVisible();
  }

  async isAudioOn(): Promise<boolean> {
    return await this.toolBar.microphoneButtonOff.isVisible();
  }

  async isCameraOn(): Promise<boolean> {
    return await this.videoPreview.isVisible();
  }

  async turnAudioOn(): Promise<boolean> {
    await this.toolBar.microphoneButton.waitFor();
    await this.toolBar.microphoneButton.click();
    await this.page.waitForTimeout(1000); // to make sure microphone is really activated
    return await this.toolBar.microphoneButtonOff.isVisible();
  }

  async turnAudioOff(): Promise<boolean> {
    await this.toolBar.microphoneButtonOff.waitFor();
    await this.toolBar.microphoneButtonOff.click();
    await this.page.waitForTimeout(1000); // to make sure microphone is really deactivated
    return await this.toolBar.microphoneButton.isVisible();
  }

  async turnCameraOn(): Promise<boolean> {
    await this.toolBar.videoButton.waitFor();
    await this.toolBar.videoButton.click();
    await this.page.waitForTimeout(1000); // to make sure camera is really activated
    // it seems that in firefox, one has to give approval for use of camera (click 'Allow' in corresponding pop-up)
    return await this.toolBar.videoButtonOff.isVisible();
  }

  async turnCameraOff(): Promise<boolean> {
    await this.toolBar.videoButtonOff.waitFor();
    await this.toolBar.videoButtonOff.click();
    await this.page.waitForTimeout(1000); // to make sure camera is really deactivated
    return await this.toolBar.videoButton.isVisible();
  }

  async leaveMeeting(): Promise<void> {
    await this.toolBar.endMeetingButton.click();
    await this.toolBar.endMeetingButton.waitFor({ state: 'detached' });
  }

  async selectPeopleTab(): Promise<void> {
    await this.peopleButton.waitFor();
    await this.peopleButton.click();
  }

  async getPeopleTabText(): Promise<string> {
    return await this.peopleButton.innerText();
  }

  async getNumberOfParticipantsInMeeting(): Promise<number> {
    const numberOfParticipants = (await this.peopleButton.locator('span').first().innerText()).trim();
    // remove brackets and return as type number
    return +numberOfParticipants.slice(1, numberOfParticipants.length - 1);
  }

  // function related to burger menu
  async openBurgerMenu() {
    await this.burgerMenuButton.click();
    const burgerMenuPage = new BurgerMenuPage({ page: this.page });
    await burgerMenuPage.burgerMenuDropdown.waitFor();
    return burgerMenuPage;
  }

  // functions related to keyboard shortcuts
  async useKeyboardShortcut(key: string): Promise<void> {
    const cameraOn: boolean = await this.isCameraOn();
    const audioOn: boolean = await this.isAudioOn();
    const viewOptionsPage: ViewOptionsPage = new ViewOptionsPage({ page: this.page });
    const isFullScreen: boolean = await viewOptionsPage.isFullScreen();

    await this.page.keyboard.press(key);

    if (this.isKeyboardShortcutOn === true) {
      switch (key) {
        case 'v': {
          if (!cameraOn) {
            await this.toolBar.videoButtonOff.waitFor();
          } else {
            await this.toolBar.videoButton.waitFor();
          }
          break;
        }

        case 'm': {
          if (!audioOn) {
            await this.toolBar.microphoneButtonOff.waitFor();
          } else {
            await this.toolBar.microphoneButton.waitFor();
          }
          break;
        }

        case 'f': {
          if (isFullScreen) {
            await viewOptionsPage.fullScreenView.waitFor({ state: 'hidden' });
          } else {
            await viewOptionsPage.fullScreenView.waitFor({ state: 'visible' });
          }
          break;
        }
      }
    }
  }

  async holdToSpeak() {
    await this.page.keyboard.down('Space');
    await this.page.waitForTimeout(config.SHORT_TIMEOUT);
  }

  async releaseHoldToSpeak() {
    await this.page.keyboard.up('Space');
    await this.page.waitForTimeout(config.SHORT_TIMEOUT);
  }

  async deactivateKeyboardShortcuts() {
    await this.keyboardShortcuts.checkbox.setChecked(false);
    this.isKeyboardShortcutOn = await this.keyboardShortcuts.checkbox.isChecked();
  }

  async closePopupDialog(method = 'BTN_x') {
    switch (method) {
      case 'BTN_x': {
        await this.closePopupDialogButton.click();
        await this.closePopupDialogButton.waitFor({ state: 'detached' });
        break;
      }

      case 'BTN_esc': {
        await this.pressEscape();
        break;
      }

      case 'outside the window': {
        await this.page.mouse.click(0, 0);
        break;
      }
    }
  }

  async showMoreOptions() {
    await this.toolBar.moreOptionButton.click();
    return new MoreOptionsPage({ page: this.page });
  }

  // utility function
  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  // function related to timer
  async startTimerModeratorTool(): Promise<TimerPage> {
    await this.moderationTools.timerButton.click();
    const timerPage = new TimerPage({ page: this.page });
    await timerPage.heading.waitFor();
    return timerPage;
  }

  async selectModeratorToolHome() {
    await this.moderationTools.homeButton.click();
    await this.searchInChatButton.isVisible();
  }

  async hasModerator(): Promise<boolean> {
    return await this.participantsAvatar.moderatorAvatar.isVisible();
  }

  public async startResetRaisedHandsModeratorTool(): Promise<ResetRaisedHandsPage> {
    await this.moderationTools.resetRaisedHandsButton.click();
    const resetRaisedHandsPage = new ResetRaisedHandsPage({ page: this.page });
    await resetRaisedHandsPage.heading.waitFor();
    return resetRaisedHandsPage;
  }

  public async startBreakoutRoomsModeratorTool(): Promise<BreakoutRoomsPage> {
    await this.moderationTools.createBreakoutRoomsButton.click();
    await waitForDomStopChanging(this.page);
    return new BreakoutRoomsPage({ page: this.page });
  }

  public async startMuteParticipantsModeratorTool(): Promise<MuteParticipantsPage> {
    await this.moderationTools.muteParticipantsButton.click();
    const muteParticipantsPage = new MuteParticipantsPage({ page: this.page });
    await muteParticipantsPage.waitForPageToBeLoaded();
    return muteParticipantsPage;
  }

  public async startVotingRoomsModeratorTool(): Promise<VotingRoomPage> {
    await this.moderationTools.createVotingRoomsButton.click();
    const votingRoomPage = new VotingRoomPage({ page: this.page });
    await votingRoomPage.votingRoomHeading.waitFor({ state: 'visible' });
    return votingRoomPage;
  }

  public async startBreakoutRooms(
    randomDistribution: boolean | null = null,
    mode: string | null = null
  ): Promise<void> {
    const breakoutRoomPage = await this.startBreakoutRoomsModeratorTool();
    if (randomDistribution != null) {
      await breakoutRoomPage.setRandomDistribution(randomDistribution);
    }
    if (mode !== null) {
      await breakoutRoomPage.setSelectionMode(mode);
    }
    await breakoutRoomPage.startRooms();
  }

  public getParticipantTileByName(name: string): ParticipantTilePage {
    const participantTileWithName = this.participantWindowLocator.filter({ hasText: name });
    return new ParticipantTilePage({ tileLocator: participantTileWithName });
  }

  public async selectCoffeeBreakModeratorTool(): Promise<CoffeeBreakPage> {
    await this.moderationTools.coffeeBreakButton.click();
    const coffeeBreakPage = new CoffeeBreakPage({ page: this.page });
    await coffeeBreakPage.heading.waitFor({ state: 'visible' });
    return coffeeBreakPage;
  }

  public async startPollModeratorTool(): Promise<PollPage> {
    await this.moderationTools.pollButton.click();
    const pollPage = new PollPage({ page: this.page });
    await pollPage.pollHeading.waitFor({ state: 'visible' });
    return pollPage;
  }

  public async isCoffeeBreakPopoverOpen(): Promise<boolean> {
    return await this.coffeeBreakDialog.coffeeBreakPopover.isVisible();
  }

  public async waitForCoffeeBreakPopoverToClose(): Promise<void> {
    await this.coffeeBreakDialog.coffeeBreakPopover.waitFor({ state: 'hidden' });
  }

  public async isCoffeeBreakPopoverClosed(): Promise<boolean> {
    return !(await this.coffeeBreakDialog.coffeeBreakPopover.isVisible());
  }

  public async isTimerCountingDown(timerText: Locator): Promise<boolean> {
    const initialText = await timerText.textContent();
    if (!initialText) {
      throw new Error('Timer text not found');
    }
    await expect(timerText).not.toHaveText(initialText);
    const [initialMin, initialSec] = initialText.trim().split(':').map(Number);
    const initialTotalSec = initialMin * 60 + initialSec;
    const updatedText = await timerText.textContent();
    if (!updatedText) {
      return false;
    }
    const [updatedMin, updatedSec] = updatedText.trim().split(':').map(Number);
    const updatedTotalSec = updatedMin * 60 + updatedSec;
    return updatedTotalSec < initialTotalSec;
  }

  public async isOptionSelected(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el) => el.classList.contains('Mui-selected'));
  }

  public async getParticipantsDetails(): Promise<string[]> {
    return (await this.chatListItems.allInnerTexts()).filter((chat) => chat.includes('joined'));
  }

  public async getAllChatListTexts(): Promise<string[]> {
    await waitForDomStopChanging(this.page);
    return (await this.chatListItems.allInnerTexts()).filter((chat) => !chat.includes('joined'));
  }

  public async getAllChatListCount(): Promise<number> {
    return (await this.getAllChatListTexts()).length;
  }

  public async scrollChatListItems(): Promise<void> {
    await waitForDomStopChanging(this.page);
    await this.chatListItems.first().scrollIntoViewIfNeeded();
  }

  public async filterChatText(message: string): Promise<string> {
    return (await this.getAllChatListTexts()).filter((text) => text.includes(message))[0];
  }

  public async getLastChatText(): Promise<string> {
    const chatListTexts = await this.getAllChatListTexts();
    return chatListTexts.slice(-1)[0] ?? chatListTexts[0];
  }

  public async openEmojiPickerDialog(): Promise<void> {
    await this.emojiPicker.click();
  }

  private getEmojiLocator(emoji: string): Locator {
    return this.page.getByText(emoji, { exact: true });
  }

  public async selectEmoji(emoji: string): Promise<void> {
    await this.getEmojiLocator(emoji).click();
  }

  public async selectChatTextbox(): Promise<void> {
    await this.chatTextbox.click();
  }

  public async typeMessage(message: string): Promise<void> {
    await this.chatTextbox.fill(message);
  }

  public async getChatTextboxPlaceholder(): Promise<string> {
    return (await this.chatTextbox.getAttribute('placeholder')) ?? '';
  }

  public async getChatTextFieldInputValue(): Promise<string> {
    return await this.chatTextArea.inputValue();
  }

  public async submitChat(): Promise<void> {
    await this.chatSubmitButton.click();
  }

  public async getEmptyMessageErrorText(): Promise<string> {
    return await this.emptyMessageError.innerText();
  }

  public async selectSearchInChatTextbox(): Promise<void> {
    await this.searchInChatButton.click();
  }

  public async getSearchInChatTextboxPlaceholder(): Promise<string> {
    return (await this.searchInChatButton.getAttribute('placeholder')) ?? '';
  }

  public async getSearchInChatTextboxValue(): Promise<string> {
    return await this.searchInChatButton.inputValue();
  }

  public async closeSearchInChatTextbox(): Promise<void> {
    await this.closeSearchInChatButton.click();
    await this.closeSearchInChatButton.waitFor({ state: 'detached' });
  }

  public async typeTextInSearchInChatTextbox(text: string): Promise<void> {
    await this.searchInChatButton.fill(text);
    await this.closeSearchInChatButton.waitFor({ state: 'visible' });
  }

  public async resetMatchedSearchedText(): Promise<void> {
    await this.resetButton.click();
  }

  public async startTalkingStickModeratorTool(): Promise<TalkingStickPage> {
    await this.moderationTools.talkingStickButton.click();
    const talkingStickPage = new TalkingStickPage({ page: this.page });
    await talkingStickPage.heading.waitFor({ state: 'visible' });
    return talkingStickPage;
  }

  public async toggleFullScreen(): Promise<void> {
    await this.videoFullScreenButton.click();
  }

  public async isVideoPlaying(): Promise<boolean | null> {
    return await this.page.evaluate(async () => {
      const video = document.querySelector('video');
      return video && video.srcObject && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    });
  }

  public async selectPeopleOption(): Promise<PeopleOptionPage> {
    await this.peopleButton.click();
    const peopleOptionPage = new PeopleOptionPage({ page: this.page });
    await peopleOptionPage.searchParticipantTextbox.waitFor({ state: 'visible' });
    return peopleOptionPage;
  }

  public async isMessageUnread(): Promise<boolean> {
    return this.messagesButton.evaluate((el) => el.classList.contains('MuiTab-labelIcon'));
  }

  public async getTotalWaitingParticipants(): Promise<number> {
    return Number(await this.waitingParticipantsIndicator.innerText());
  }

  public async acceptParticipant(participantName: string): Promise<void> {
    await this.waitingListButton.click();
    const approveWaitingParticipantLocator = this.waitingParticipants
      .filter({ hasText: participantName })
      .locator('button');
    await approveWaitingParticipantLocator.click();
    await approveWaitingParticipantLocator.waitFor({ state: 'detached' });
  }
}
