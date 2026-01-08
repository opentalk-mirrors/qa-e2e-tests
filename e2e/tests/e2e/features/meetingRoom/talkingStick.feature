# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Talking stick
  As a meeting moderator
  I want to enforce speaking in turns
  So that all participants have a fair chance to contribute during the meeting.

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And 3 guests have joined the meeting of "Alice"

  @smoke
  Scenario: TC_001_Meeting Room_As Moderator_Talking stick
    When "Alice" opens the Talking Stick moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Talking stick"
    And the order selection field with the "Name (A - Z)" button should be displayed in the Talking Stick moderator tool for "Alice"
    And "Include moderator" should be switched ON in the Talking Stick moderator tool for "Alice"
    And the participants list should be displayed in "Ascending" order in the Talking Stick moderator tool for "Alice"
    And the participants joined time should have the format “Joined HH:MM” in the Talking Stick moderator tool for "Alice"
    And the audio status for each participant in the Meeting room should be turned off by default in the Talking Stick moderator tool for "Alice"
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Start now |


  Scenario: TC_002_Meeting Room_As Moderator_Talking stick_Order selection field
    When "Alice" opens the Talking Stick moderator tool
    And "Alice" shows the possible order selections in the Talking Stick moderator tool
    Then these "menu items" should be displayed in the open moderator tool for "Alice":
      | Name (A - Z)    |
      | Name (Z - A)    |
      | First Join Time |
      | Last Join Time  |
      | Random          |

    When "Alice" orders the participants by "Name (Z - A)" in the Talking Stick moderator tool
    Then the order selection dropdown should not be displayed in the Talking Stick moderator tool for "Alice"
    And the order selection field with the "Name (Z - A)" button should be displayed in the Talking Stick moderator tool for "Alice"
    And the participants list should be displayed in "Descending" order in the Talking Stick moderator tool for "Alice"

    When "Alice" shows the possible order selections in the Talking Stick moderator tool
    Then the order selection dropdown menu should be displayed in the Talking Stick moderator tool for "Alice"

    When "Alice" orders the participants by "First Join Time" in the Talking Stick moderator tool
    Then the order selection dropdown should not be displayed in the Talking Stick moderator tool for "Alice"
    And the order selection field with the "First Join Time" button should be displayed in the Talking Stick moderator tool for "Alice"
    And the participants list should be displayed in "First Join Time" order in the Talking Stick moderator tool for "Alice"

    When "Alice" shows the possible order selections in the Talking Stick moderator tool
    And "Alice" orders the participants by "Last Join Time" in the Talking Stick moderator tool
    Then the order selection dropdown should not be displayed in the Talking Stick moderator tool for "Alice"
    And the order selection field with the "Last Join Time" button should be displayed in the Talking Stick moderator tool for "Alice"
    And the participants list should be displayed in "Last Join Time" order in the Talking Stick moderator tool for "Alice"

    When "Alice" shows the possible order selections in the Talking Stick moderator tool
    And "Alice" orders the participants by "Random" in the Talking Stick moderator tool
    Then the order selection dropdown should not be displayed in the Talking Stick moderator tool for "Alice"
    And the order selection field with the "Random" button should be displayed in the Talking Stick moderator tool for "Alice"
    # Instead of checking the random order, just verify the number the guests in the meeting,
    # because the order is truly random. In some cases, it might match the initial order, which would cause the test to fail.
    And 3 participants should be displayed in the open moderator tool for "Alice"

    When "Alice" shows the possible order selections in the Talking Stick moderator tool
    And "Alice" orders the participants by "Name (A - Z)" in the Talking Stick moderator tool
    Then the order selection dropdown should not be displayed in the Talking Stick moderator tool for "Alice"
    And the order selection field with the "Name (A - Z)" button should be displayed in the Talking Stick moderator tool for "Alice"
    And the participants list should be displayed in "Ascending" order in the Talking Stick moderator tool for "Alice"
