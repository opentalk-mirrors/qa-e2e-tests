# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own
  As a user
  I want to distinguish my meetings from meetings created by other users 
  So that I can manage my meetings

  Scenario Outline: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own & if created by other user_with 3-dot button
    Given "Bob" has logged in
    And "Bob" has created a <meeting-type> meeting with the title "bob1"
    And "Bob" has invited "Alice" to meeting "bob1"
    And "Alice" has logged in
    And "Alice" has accepted the invitation for the meeting with the title "bob1" created by "Bob"
    And "Alice" has created a <meeting-type> meeting with the title "ali1"
    When "Alice" checks the current meetings on the Home page
    Then "Alice" should see the following details for meeting "ali1" on the Home page
      | detail        | value                       |
      | time          | <time>                      |
      | meeting title | ali1                        |
      | creator       | Created by alice alice (Me) |
    And "Alice" should see the following buttons for meeting "ali1" on the Home page
      | buttons      |
      | 3-dot option |
      | Start        |
    And "Alice" should see the following details for meeting "bob1" on the Home page
      | detail        | value                 |
      | time          | <time>                |
      | meeting title | bob1                  |
      | creator       | Created by Bob Burton |
    And "Alice" should see the following buttons for meeting "bob1" on the Home page
      | buttons      |
      | 3-dot option |
      | Start        |
    When "Alice" checks more options for meeting "ali1" on the Home page
    Then "Alice" should see the following options on the Home page:
      | options           |
      | Edit              |
      | Add to favorites  |
      | Details           |
      | Copy Meeting-Link |
      | Copy Guest-Link   |
      | Delete            |
    When "Alice" checks more options for meeting "bob1" on the Home page
    Then "Alice" should see the following options on the Home page:
      | options           |
      | Decline           |
      | Add to favorites  |
      | Details           |
      | Copy Meeting-Link |
    Examples:
      | meeting-type | time               |
      | unscheduled  | Time-independent   |
      | scheduled    | %date_time_format% |
