# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own
  As a user
  I want to distinguish my meetings from meetings created by other users
  So that I can manage my meetings

  @smoke
  Scenario Outline: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own & if created by other user_with 3-dot button
    Given "Bob" has logged in
    And "Bob" has created a <meeting-type> meeting with the title "bob1"
    And "Bob" has invited "Alice" to meeting "bob1"
    And "Alice" has logged in
    And "Alice" has accepted the invitation for the meeting with the title "bob1" created by "Bob"
    And "Alice" has created a <meeting-type> meeting with the title "ali1"
    When "Alice" navigates to the Home-Page
    Then there should be 1 meeting with the name "ali1" on the Home-Page for "Alice"
    And the following details should be displayed for meeting "ali1" on the Home-Page for "Alice":
      | detail        | value                        |
      | time          | <time>                      |
      | meeting title | ali1                         |
      | creator       | Created by Alice Hansen (Me) |
    And the following buttons should be displayed for meeting "ali1" on the Home-Page for "Alice":
      | buttons      |
      | 3-dot option |
      | Start        |
    And there should be 1 meeting with the name "bob1" on the Home-Page for "Alice"
    And the following details should be displayed for meeting "bob1" on the Home-Page for "Alice":
      | detail        | value                 |
      | time          | <time>                |
      | meeting title | bob1                  |
      | creator       | Created by Bob Burton |
    And the following buttons should be displayed for meeting "bob1" on the Home-Page for "Alice":
      | buttons      |
      | 3-dot option |
      | Start        |
    When "Alice" checks more options for meeting "ali1" on the Home-Page
    Then the following options should be displayed on the Home-Page for "Alice":
      | options           |
      | Edit              |
      | Add to favorites  |
      | Details           |
      | Copy Meeting-Link |
      | Copy Guest-Link   |
      | Delete            |
    When "Alice" checks more options for meeting "bob1" on the Home-Page
    Then the following options should be displayed on the Home-Page for "Alice":
      | options           |
      | Decline           |
      | Add to favorites  |
      | Details           |
      | Copy Meeting-Link |
    Examples:
      | meeting-type | time               |
      | unscheduled  | Time-independent   |
      | scheduled    | %date_time_format% |


  Scenario: TC_011_Dashboard_Home_My favorite meetings_if empty list (and) also with presence of favorite meetings list
    Given "Alice" has logged in
    And "Alice" has created a scheduled meeting with the title "meeting 1"
    And "Alice" has created a scheduled meeting with the title "meeting 2"
    And "Alice" has created a scheduled meeting with the title "meeting 3"
    And "Alice" has created a scheduled meeting with the title "meeting 4"
    When "Alice" navigates to the Home-Page
    Then for "Alice" following details should be displayed on Home-Page
      | details                   |
      | no-favorite-meetings-text |
      | bookmark icon             |
    When "Alice" hovers over "no-favorite-meetings-text" on the Home-Page
    Then for "Alice" a tooltip with the text "mark-favorites-tooltip" should be shown on the Home-Page
    When "Alice" selects "no-favorite-meetings-text" on the Home-Page
    Then for "Alice" the Meetings list should be displayed
    When "Alice" marks the meeting named "meeting 1" as favorite on the Home-Page
    Then for "Alice" the meeting "meeting 1" should be marked as favorite on the Home-Page
    When "Alice" marks the meeting named "meeting 2" as favorite on the Home-Page
    Then for "Alice" the meeting "meeting 2" should be marked as favorite on the Home-Page
    When "Alice" marks the meeting named "meeting 3" as favorite on the Home-Page
    Then for "Alice" the meeting "meeting 3" should be marked as favorite on the Home-Page
    When "Alice" marks the meeting named "meeting 4" as favorite on the Home-Page
    Then for "Alice" the meeting "meeting 4" should be marked as favorite on the Home-Page
    When "Alice" navigates to the Home-Page
    Then for "Alice" these meetings should be displayed under the My favorite meetings label with a bookmark icon on the Home-Page:
      | meeting   |
      | meeting 1 |
      | meeting 2 |
      | meeting 3 |
      | meeting 4 |
    When "Alice" selects meeting "meeting 1" on the Home-Page
    Then "Alice" should be on the Lobby-Page of the meeting named "meeting 1"
