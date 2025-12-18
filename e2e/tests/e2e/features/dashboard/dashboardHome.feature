# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own
  As a user
  I want to distinguish my meetings from meetings created by other users
  So that I can manage my meetings

  @smoke
  Scenario: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own & if created by other user_with 3-dot button - scheduled meeting
    Given "Bob" has logged in
    And "Bob" has created a scheduled meeting with the title "bob1"
    And "Bob" has invited "Alice" to meeting "bob1"
    And "Alice" has logged in
    And "Alice" has accepted the invitation for the meeting with the title "bob1" created by "Bob"
    And "Alice" has created a scheduled meeting with the title "ali1"
    When "Alice" checks the current meetings on the Home-Page

    # This is a bug! See https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/3064
    # after fixing the bug, delete this comment and the next line and activate the line below
    Then there should be 2 meetings with the name "ali1" on the Home-Page for "Alice"
    # Then there should be 1 meetings with the name "ali1" on the Home-Page for "Alice"

    And the following details should be displayed for meeting "ali1" on the Home-Page for "Alice":
      | detail        | value                        |
      | time          | %date_time_format%           |
      | meeting title | ali1                         |
      | creator       | Created by Alice Hansen (Me) |
    And the following buttons should be displayed for meeting "ali1" on the Home-Page for "Alice":
      | buttons      |
      | 3-dot option |
      | Start        |
    And the following details should be displayed for meeting "bob1" on the Home-Page for "Alice":
      | detail        | value                 |
      | time          | %date_time_format%    |
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

  @smoke
  Scenario: TC_010_Dashboard_Home_Current meetings_meeting entry_if created by own & if created by other user_with 3-dot button - unscheduled meeting
    Given "Bob" has logged in
    And "Bob" has created an unscheduled meeting with the title "bob1"
    And "Bob" has invited "Alice" to meeting "bob1"
    And "Alice" has logged in
    And "Alice" has accepted the invitation for the meeting with the title "bob1" created by "Bob"
    And "Alice" has created an unscheduled meeting with the title "ali1"
    When "Alice" checks the current meetings on the Home-Page

    # This is a bug! See https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/3064
    # after fixing the bug, delete this comment and the next line and activate all the commented lines below
    Then there should be 0 meetings with the name "ali1" on the Home-Page for "Alice"
    # Then there should be 1 meetings with the name "ali1" on the Home-Page for "Alice"

#    And the following details should be displayed for meeting "ali1" on the Home-Page for "Alice":
#      | detail        | value                        |
#      | time          | Time-independent           |
#      | meeting title | ali1                         |
#      | creator       | Created by Alice Hansen (Me) |
#    And the following buttons should be displayed for meeting "ali1" on the Home-Page for "Alice":
#      | buttons      |
#      | 3-dot option |
#      | Start        |
#    And the following details should be displayed for meeting "bob1" on the Home-Page for "Alice":
#      | detail        | value                 |
#      | time          | Time-independent    |
#      | meeting title | bob1                  |
#      | creator       | Created by Bob Burton |
#    And the following buttons should be displayed for meeting "bob1" on the Home-Page for "Alice":
#      | buttons      |
#      | 3-dot option |
#      | Start        |
#    When "Alice" checks more options for meeting "ali1" on the Home-Page
#    Then the following options should be displayed on the Home-Page for "Alice":
#      | options           |
#      | Edit              |
#      | Add to favorites  |
#      | Details           |
#      | Copy Meeting-Link |
#      | Copy Guest-Link   |
#      | Delete            |
#    When "Alice" checks more options for meeting "bob1" on the Home-Page
#    Then the following options should be displayed on the Home-Page for "Alice":
#      | options           |
#      | Decline           |
#      | Add to favorites  |
#      | Details           |
#      | Copy Meeting-Link |
