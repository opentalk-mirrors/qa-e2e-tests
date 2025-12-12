// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { config } from '../../config';
import { changeLanguage, createMeetingAsset, deleteMeetings } from '../../helper/Api';
import { planNewMeetingAndStartAsModerator } from '../../helper/meetingHelpers';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { MeetingDetailsPage } from '../../pages/MeetingDetailsPage';
import { MyFilesPage } from '../../pages/MyFilesPage';
import { MyMeetingsPage } from '../../pages/MyMeetingsPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { AccountPage } from '../../pages/Settings/AccountPage';
import { GeneralPage } from '../../pages/Settings/GeneralPage';
import { ProfilePage } from '../../pages/Settings/ProfilePage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import { StoragePage } from '../../pages/Settings/StoragePage';
import { SidebarPage } from '../../pages/SidebarPage';

const FIRSTNAME: string = config.USER_FIRSTNAME;
const FAMILYNAME: string = config.USER_FAMILYNAME;

test.describe('Dashboard_Settings', () => {
  let sideBarPage: SidebarPage,
    settingsPage: SettingsPage,
    generalPage: GeneralPage,
    homePage: HomePage,
    myMeetingsPage: MyMeetingsPage;

  test.beforeEach(async ({ page, browserName }) => {
    await changeLanguage('en-US');
    sideBarPage = new SidebarPage({ page });
    settingsPage = await sideBarPage.navigateToSettingsPage();
    generalPage = new GeneralPage(settingsPage.page);

    if (browserName === 'webkit') {
      await closeWebkitPopUp({ page });
    }
  });

  test.skip('TC_001_Dashboard_Settings_General', async () => {
    await expect(settingsPage.settingsHeading).toBeVisible();
    await expect(settingsPage.generalLink).toHaveText('General');
    expect(await settingsPage.isOptionSelected(settingsPage.generalLink)).toBeTruthy();
    await expect(settingsPage.profileLink).toBeVisible();
    await expect(settingsPage.accountLink).toBeVisible();
    await expect(settingsPage.storageLink).toBeVisible();

    await expect(generalPage.languageHeading).toHaveText('Language');
    await expect(generalPage.languageDropdownMenu.selectedField).toBeVisible();
    await expect(generalPage.saveButton).toHaveText('Save');

    await generalPage.openLanguageDropdown();
    await expect(generalPage.languageDropdownMenu.optionsDropdown).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.deutsch).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.english).toBeVisible();

    await generalPage.selectLanguage('deutsch');
    await expect(generalPage.languageDropdownMenu.optionsDropdown).not.toBeVisible();
    await expect(generalPage.languageDropdownMenu.selectedField).toHaveText('Deutsch');

    await generalPage.saveSelectedLanguage();
    await expect(generalPage.successMessage).toHaveText('Deine Einstellungen wurden erfolgreich gespeichert.');
    await expect(generalPage.languageHeading).toHaveText('Sprache');
    await expect(generalPage.saveButton).toHaveText('Änderungen speichern');

    homePage = await sideBarPage.navigateToHomePage();
    await expect(homePage.startNewMeetingButton).toHaveText('Meeting starten');
    await expect(homePage.favoriteMeetingsHeaderSelector).toHaveText('Meine Favoriten');

    myMeetingsPage = await sideBarPage.navigateToMyMeetingsPage();
    await expect(myMeetingsPage.myMeetingsHeading).toHaveText('Meine Meetings');
    await expect(myMeetingsPage.planNewLink).toHaveText('Meeting planen');

    settingsPage = await sideBarPage.navigateToSettingsPage();
    await expect(generalPage.languageHeading).toHaveText('Sprache');
    await expect(generalPage.languageDropdownMenu.selectedField).toBeVisible();
    await expect(generalPage.saveButton).toHaveText('Änderungen speichern');

    await expect(settingsPage.generalLink).toHaveText('Allgemein');
    expect(await settingsPage.isOptionSelected(settingsPage.generalLink)).toBeTruthy();
    await generalPage.openLanguageDropdown();
    await expect(generalPage.languageDropdownMenu.optionsDropdown).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.deutsch).toBeVisible();
    await expect(generalPage.languageDropdownMenu.options.english).toBeVisible();

    await generalPage.selectLanguage('english');
    await expect(generalPage.languageDropdownMenu.optionsDropdown).not.toBeVisible();
    await expect(generalPage.languageDropdownMenu.selectedField).toHaveText('English');

    await generalPage.saveSelectedLanguage();
    await expect(generalPage.successMessage).toHaveText('Your settings have been saved successfully.');
    await expect(generalPage.languageHeading).toHaveText('Language');
    await expect(generalPage.saveButton).toHaveText('Save');

    homePage = await sideBarPage.navigateToHomePage();
    await expect(homePage.startNewMeetingButton).toHaveText('Start new');
    await expect(homePage.favoriteMeetingsHeaderSelector).toHaveText('My favorite meetings');

    myMeetingsPage = await sideBarPage.navigateToMyMeetingsPage();
    await expect(myMeetingsPage.myMeetingsHeading).toHaveText('My Meetings');
    await expect(myMeetingsPage.planNewLink).toHaveText('Plan new');
  });

  test.describe('TC_002_Dashboard_Settings_Profile option', () => {
    test('TC_002_Dashboard_Settings_Profile option', async () => {
      const myProfileName = 'Bob';
      const profilePage: ProfilePage = await settingsPage.navigateToProfile();
      await expect(profilePage.profilePictureHeading).toBeVisible();
      await expect(profilePage.requiredFieldsText).toBeVisible();
      await expect(profilePage.imageAvatar).toBeVisible();
      await expect(profilePage.profileNameLabel).toBeVisible();
      expect(await profilePage.getProfileNameTextboxValue()).toBe(FIRSTNAME + ' ' + FAMILYNAME);
      await expect(profilePage.enterANameText).toBeVisible();
      await expect(profilePage.saveButton).toBeVisible();

      await profilePage.selectProfileNameInputField();
      await expect(profilePage.profileNameTextbox).toBeEnabled();

      await profilePage.clearProfileName();
      expect(await profilePage.getPlaceholderValueOfProfileNameTextbox()).toBe('John Doe');
      expect(await profilePage.getErrorText()).toBe('Error: "Profile Name" is a required field');

      expect(await profilePage.saveProfile()).toBeFalsy();

      await profilePage.enterProfileName(myProfileName);
      expect(await profilePage.getProfileNameTextboxValue()).toBe(myProfileName);

      await profilePage.saveProfile();
      const notificationPage = new NotificationPage({ page: profilePage.page });
      expect(await notificationPage.getAlertNotificationText()).toBe('Your settings have been saved successfully.');
      await expect(sideBarPage.profileName).toHaveText(myProfileName);
    });

    //cleanup
    test.afterAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const sideBarPage = new SidebarPage({ page });
      const settingsPage = await sideBarPage.navigateToSettingsPage();

      const profilePage: ProfilePage = await settingsPage.navigateToProfile();
      await profilePage.enterProfileName(FIRSTNAME + ' ' + FAMILYNAME);
      await profilePage.saveProfile();

      await context.close();
    });
  });

  test('TC_003_Dashboard_Settings_Account option', async () => {
    const USER_EMAIL: string = process.env.USER_EMAIL!;

    const accountPage: AccountPage = await settingsPage.navigateToAccount();
    await expect(accountPage.generalInformationHeading).toBeVisible();
    await expect(accountPage.emailTextbox).toBeVisible();
    await expect(accountPage.firstNameTextbox).toBeVisible();
    await expect(accountPage.familyNameTextbox).toBeVisible();

    await expect(accountPage.emailTextbox).toHaveValue(USER_EMAIL);

    await accountPage.focusEmailAddressField();
    await expect(accountPage.emailTextbox).not.toBeEditable();

    await expect(accountPage.firstNameTextbox).toHaveValue(FIRSTNAME);

    await accountPage.focusFirstNameField();
    await expect(accountPage.firstNameTextbox).not.toBeEditable();

    await expect(accountPage.familyNameTextbox).toHaveValue(FAMILYNAME);

    await accountPage.focusFamilyNameField();
    await expect(accountPage.familyNameTextbox).not.toBeEditable();
  });

  test('TC_004_Dashboard_Settings_Storage option', async ({ page, context }) => {
    const MEETING_TITLE = 'myMeeting';
    const INDEX = 0;
    const { meetingRoomName, roomId } = await planNewMeetingAndStartAsModerator(page, MEETING_TITLE, undefined);

    const eventTitle = 'event';
    const fileExt = 'pdf';
    const kind = 'record';
    for (let i = 0; i < 6; i++) {
      await createMeetingAsset('dummyMeetingAsset.pdf', roomId, `${eventTitle}${i}`, fileExt, kind);
    }

    settingsPage = await sideBarPage.navigateToSettingsPage();
    const storagePage: StoragePage = await settingsPage.navigateToStorage();
    await storagePage.page.bringToFront();
    await expect(storagePage.storageHeading).toBeVisible();
    await expect(storagePage.storageUsedText).toBeVisible();
    await expect(storagePage.myFilesHeading).toBeVisible();

    let myFilesPage = new MyFilesPage(storagePage.page);
    await expect(myFilesPage.filenameColumn).toBeVisible();
    await expect(myFilesPage.createdColumn).toBeVisible();
    await expect(myFilesPage.sizeColumn).toBeVisible();
    await expect(myFilesPage.actionsColumn).toBeVisible();

    await myFilesPage.scrollFiles();

    const filenameRegex = new RegExp(
      `^${eventTitle}\\d*_${kind}_\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}-UTC\\.${fileExt}$`
    );
    expect(await myFilesPage.getFileName(INDEX)).toMatch(filenameRegex);

    expect(await myFilesPage.getFileCreated(INDEX)).toMatch(/^\d{2}:\d{2} \d{2}\.\d{2}\.\d{4}$/);

    expect(await myFilesPage.getFileSize(INDEX)).toMatch(/^\d+(?:\.\d{2})? (Bytes|KB|MB)$/);

    await expect(myFilesPage.getDownloadButtonLocator(INDEX)).toBeVisible();
    await expect(myFilesPage.getDeleteButtonLocator(INDEX)).toBeVisible();

    const downloadedFile = await myFilesPage.downloadFile(INDEX);
    expect(downloadedFile).not.toBeNull();

    expect(await myFilesPage.getContentOfFileAsText(downloadedFile)).toContain('Hello from OpenTalk!');

    let filenameToDelete: string = await myFilesPage.getFileName(INDEX);
    const filenameToBePresent = await myFilesPage.getFileName(INDEX + 1);
    expect(await myFilesPage.isFilePresent(filenameToDelete)).toBeTruthy();
    await myFilesPage.deleteFile(filenameToDelete);
    expect(await myFilesPage.isFilePresent(filenameToDelete)).toBeFalsy();
    expect(await myFilesPage.isFilePresent(filenameToBePresent)).toBeTruthy();

    const newPage = await context.newPage();
    const homePage: HomePage = new HomePage({ page: newPage });
    await homePage.navigateToHomePage();
    const meetingDetailsPage: MeetingDetailsPage = await homePage.showMeetingDetails(meetingRoomName);
    myFilesPage = new MyFilesPage(meetingDetailsPage.page);
    expect(await myFilesPage.isFilePresent(filenameToDelete)).toBeFalsy();

    filenameToDelete = await myFilesPage.getFileName(INDEX);
    await myFilesPage.deleteFile(filenameToDelete);
    expect(await myFilesPage.isFilePresent(filenameToDelete)).toBeFalsy();
    await storagePage.page.bringToFront();
    await storagePage.page.reload();
    expect(await myFilesPage.isFilePresent(filenameToDelete)).toBeFalsy();

    //cleanup
    await deleteMeetings(config.USER_NAME);
  });
});
