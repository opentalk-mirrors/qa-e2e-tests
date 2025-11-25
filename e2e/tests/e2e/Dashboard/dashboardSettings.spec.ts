// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { config } from '../../config';
import { changeLanguage } from '../../helper/Api';
import { closeWebkitPopUp } from '../../helper/webkit';
import { HomePage } from '../../pages/HomePage';
import { MyMeetingsPage } from '../../pages/MyMeetingsPage';
import { NotificationPage } from '../../pages/NotificationPage';
import { AccountPage } from '../../pages/Settings/AccountPage';
import { GeneralPage } from '../../pages/Settings/GeneralPage';
import { ProfilePage } from '../../pages/Settings/ProfilePage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
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

  test('TC_004_Dashboard_Settings_Storage option', async ({ page }) => {
    //verify the options/details available in Account option of Settings option in Dashboard
    const homePage = new HomePage({ page });
    await homePage.navigateToHomePage();
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('link', { name: 'Storage', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Storage', exact: true })).toBeVisible();
    await expect(page.getByText('used')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Files' })).toBeVisible();
    /*
    todo for everything else we need dummy meetings and data https://git.opentalk.dev/opentalk/qa/reports/-/issues/79?show=5053
    rest-api is needed to go on here https://git.opentalk.dev/opentalk/userstories/-/issues/15
     */
  });
});
