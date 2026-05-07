// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { config } from '../config';
import { startAdhocMeetingAsModerator } from '../helper/meetingHelpers';
import { joinMeetingRoomWithNGuests } from '../helper/playwrightMeetingHelpers';
import { ViewOptionsPage } from '../pages/MeetingRoom/ViewOptionsPage';

const NUMBER_OF_GUESTS = 5;
const SMALL_NUMBER_OF_GUESTS = 2;

let viewOptionsPage: ViewOptionsPage;

test.describe('MeetingRoom - adjust participant view', () => {
  test('TC_001_VideoRoom_ParticipantViewSettings_List', async ({ page, browserName }) => {
    const { meetingRoomPage } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // when opening grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();
    await expect(viewOptionsPage.viewAndSortingPopupMenu).toBeVisible();

    expect(await viewOptionsPage.getOptionsListText()).toEqual([
      'Grid-View',
      'Speaker-View',
      'Fullscreen',
      'Join time',
      'Camera status',
      'Role',
      '6 tiles',
      '9 tiles',
      '16 tiles',
      '24 tiles',
    ]);
    for (const option of await viewOptionsPage.getOptionsList()) {
      await expect(option).toBeVisible();
    }
  });

  test('TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView', async ({ page, browser, browserName }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(browser, guestLink, 'guest', NUMBER_OF_GUESTS);
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);
    await meetingRoomPage.page.bringToFront();
    // open grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();

    // choose speaker view
    await viewOptionsPage.selectSpeakerViewOption();

    // check the speaker view and pin some users
    const defaultPinnedParticipant = await viewOptionsPage.getPinnedParticipantNameInSpeakerView();
    // speaker is in first place
    expect(await viewOptionsPage.getFirstParticipantNameInSpeakerView()).toBe(defaultPinnedParticipant);
    // pinned user is shown at top and the user that joined after pinned user is shown at first among all participant thumbs
    expect(await viewOptionsPage.getThumbsNthParticipantNameInSpeakerView(1)).toBe('guest2');
    // pin some user (3rd participant)
    const pinnedParticipant = await viewOptionsPage.pinNthParticipantInSpeakerView('guest3');
    expect(defaultPinnedParticipant).not.toBe(pinnedParticipant);
    expect(await viewOptionsPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant);
    // pin another user (2nd participant)
    const pinnedParticipant2 = await viewOptionsPage.pinNthParticipantInSpeakerView('guest2');
    expect(await viewOptionsPage.getPinnedParticipantNameInSpeakerView()).toBe(pinnedParticipant2);
  });

  test('TC_003_VideoRoom_ParticipantViewSettings_List_FullScreen', async ({ page, browser, browserName }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 2 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(browser, guestLink, 'guest', SMALL_NUMBER_OF_GUESTS);
    await meetingRoomPage.page.bringToFront();
    await meetingRoomPage.peopleButton.click();
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(SMALL_NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name & choose full screen view
    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectFullScreenViewOption();
    expect(await viewOptionsPage.isFullScreen()).toBeTruthy();

    // assert that nothing else is shown except for the meeting room options, plus they should fade out after 3 sec
    // click mouse somewhere to trigger toolbar to become visible again (toolbar might already have faded out bc time spent on assertions above)
    await meetingRoomPage.page.mouse.click(100, 100);
    await meetingRoomPage.page.waitForTimeout(config.SHORT_TIMEOUT); // wait for a little moment because toolbar fades in
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeVisible();
    await meetingRoomPage.page.waitForTimeout(config.SHORT_TIMEOUT);
    await expect(meetingRoomPage.toolBar.toolBarPanel).toBeHidden();

    // exit full screen mode
    await viewOptionsPage.closeFullScreenMode();
    expect(await viewOptionsPage.isFullScreen()).toBeFalsy();
    // grid view is shown with 2 participant windows being centered and in the same size
    expect(await viewOptionsPage.getNumberOfParticipantWindowsInGridView()).toBe(2);
    expect(await viewOptionsPage.getGridViewNthParticipantWindowSize(1)).toBe(
      await viewOptionsPage.getGridViewNthParticipantWindowSize(2)
    );
  });

  test('TC_004_VideoRoom_ParticipantViewSettings_List_GridView', async ({ page, browser, browserName }) => {
    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    await joinMeetingRoomWithNGuests(browser, guestLink, 'guest', NUMBER_OF_GUESTS);
    await meetingRoomPage.page.bringToFront();
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);

    // open grid view options besides the meeting room name
    await viewOptionsPage.displayViewOptionsMenu();

    // all 5 participant windows are centered
    for (let i = 1; i <= NUMBER_OF_GUESTS; i++) {
      expect(await viewOptionsPage.getGridViewNthParticipantWindowAlignment(i)).toBe('center');
    }
    // all 5 participant windows have same size
    const firstParticipantWindowSize = await viewOptionsPage.getGridViewNthParticipantWindowSize(1);
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      expect(firstParticipantWindowSize).toBe(await viewOptionsPage.getGridViewNthParticipantWindowSize(i));
    }
  });

  test('TC_005_VideoRoom_ParticipantViewSettings_List_Sorting', async ({ page, browser, browserName }) => {
    test.skip(browserName === 'webkit');
    // in webkit one needs to give permission to turn camera on therefore skip webkit until solution for this is found

    const { meetingRoomPage, guestLink } = await startAdhocMeetingAsModerator(page, browserName);
    const firstJoinedParticipantName = await meetingRoomPage.getUserName();
    viewOptionsPage = new ViewOptionsPage({ page: meetingRoomPage.page });

    // join with 5 guests (in separate browser instances)
    const guestPages = await joinMeetingRoomWithNGuests(browser, guestLink, 'guest', NUMBER_OF_GUESTS);
    expect(await meetingRoomPage.getNumberOfParticipantsInMeeting()).toBe(NUMBER_OF_GUESTS + 1);
    await meetingRoomPage.page.bringToFront();
    const firstGuestMeetingRoomPage = guestPages['guest1'];
    const secondGuestMeetingRoomPage = guestPages['guest2'];

    const firstGuestViewOptionsPage = new ViewOptionsPage({ page: firstGuestMeetingRoomPage.page });
    const secondGuestViewOptionsPage = new ViewOptionsPage({ page: secondGuestMeetingRoomPage.page });

    // turn on the camera of one guest & assert video from the guest is shown
    expect(await meetingRoomPage.isCameraOn()).toBeFalsy();
    expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    expect(await secondGuestMeetingRoomPage.isCameraOn()).toBeFalsy();
    await firstGuestMeetingRoomPage.page.bringToFront();
    await firstGuestMeetingRoomPage.turnCameraOn();
    expect(await firstGuestMeetingRoomPage.isCameraOn()).toBeTruthy();

    // as moderator, open grid view options besides the meeting room name & select activated camera first
    await meetingRoomPage.page.bringToFront();
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectActivatedCameraFirstSortingOption();

    // assert that guest user with the activated camera is on the first position on the left side
    expect(await viewOptionsPage.isGridViewNthParticipantCameraOn(1)).toBeTruthy();
    // and for all other participants camera is not activated
    for (let i = 2; i <= NUMBER_OF_GUESTS; i++) {
      expect(await viewOptionsPage.isGridViewNthParticipantCameraOn(i)).toBeFalsy();
    }

    // as guest, open grid view options besides the meeting room name & select moderators first
    // test on second guest because moderator would be shown by default in first position for the first guest
    await secondGuestViewOptionsPage.displayViewOptionsMenu();
    await secondGuestViewOptionsPage.selectModeratorsFirstSortingOption();

    // assert that the moderator is now on the first position
    const moderatorName = await meetingRoomPage.getUserName();
    const moderatorFirstViewFirstPositionName = await secondGuestViewOptionsPage.getNthParticipantNameInGridView(1);
    expect(moderatorFirstViewFirstPositionName).toBe(moderatorName);

    // as moderator, change to speaker view & assert that sorting resets after changing the view
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectSpeakerViewOption();

    // assert active speaker is first shown
    await firstGuestMeetingRoomPage.turnAudioOn();
    const activeParticipantName = await firstGuestMeetingRoomPage.getUserName();
    const speakerViewFirstPositionName = await viewOptionsPage.getPinnedParticipantNameInSpeakerView();
    await expect(speakerViewFirstPositionName).toBe(activeParticipantName);

    /*
    // assert that without an active speaker, the moderator is shown
    // see https://git.opentalk.dev/opentalk/qa/reports/-/work_items/355#note_215290
    // assertion must be done on a guest page (though not first guest because first guest would not be visible on it's own page)
    // and view of guest page needs to be switched to speaker view
    await firstGuestMeetingRoomPage.turnCameraOff();
    await firstGuestMeetingRoomPage.turnAudioOff();
    await secondGuestMeetingRoomPage.displayViewOptionsMenu();
    await secondGuestMeetingRoomPage.selectSpeakerViewOption();
    await secondGuestMeetingRoomPage.page.waitForTimeout(config.MEDIUM_TIMEOUT); // without timeout this seems to make CI fail
    const speakerViewNoActiveParticipantFirstPositionName =
      await secondGuestMeetingRoomPage.getPinnedParticipantNameInSpeakerView();
    await expect(speakerViewNoActiveParticipantFirstPositionName).toBe(moderatorName);
    await firstGuestMeetingRoomPage.turnCameraOn(); // reset camera
    */

    // change back to grid view
    await viewOptionsPage.displayViewOptionsMenu();
    await viewOptionsPage.selectGridViewOption();

    // as guest, assert order is set by default on first joined
    const gridViewFirstPositionName = await firstGuestViewOptionsPage.getNthParticipantNameInGridView(1);
    expect(gridViewFirstPositionName).toBe(firstJoinedParticipantName);
  });
});
