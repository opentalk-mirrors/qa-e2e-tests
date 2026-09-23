# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Breakout Room
  As a moderator
  I want to be able to create Breakout Rooms
  So that the participants can have discussions in smaller groups
  # https://git.opentalk.dev/opentalk/qa/reports/-/issues/19

  Background:
    Given user "Alice" has been created
    And "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator

  @smoke
  Scenario: Meeting Room As Moderator Create Breakout Rooms Moderator sidebar tool
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/244
    When "Alice" opens the Breakout Rooms moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Breakout rooms"
    And these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value          |
      | Duration            | Unlimited Time |
      | By number of        | Rooms          |
      | Number of rooms     | 1              |
      | Random distribution | disabled       |
    And these rooms should be listed as to be created in the Breakout Rooms moderator tool of "Alice"
      | Room 1 (0) |
    And a "Start rooms" button should be displayed in the Breakout Rooms moderator tool for "Alice"
    And the "By number of" setting in the Breakout Rooms moderator tool for "Alice" should have these options:
      | Rooms        |
      | Participants |


  Scenario: Meeting Room As Moderator random distribution option
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/248
    When "Alice" opens the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value    |
      | Random distribution | disabled |
    When "Alice" enables "Random distribution" in the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value   |
      | Random distribution | enabled |
    When "Alice" disables "Random distribution" in the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value    |
      | Random distribution | disabled |


  Scenario: Meeting Room As Moderator duration option
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/246
    Given "Alice" has opened the Breakout Rooms moderator tool
    When "Alice" opens the session duration dialog in the moderator tool
    Then the heading in the session duration dialog should be "Session Duration" in the open moderator tool for "Alice"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Unlimited Time |
      | 5 min          |
      | 10 min         |
      | 15 min         |
      | 30 min         |
      | Custom         |
      | Save           |
      | Close          |

    When "Alice" selects "Unlimited Time" duration in the duration dialog in the moderator tool
    Then the "Unlimited Time" duration should be selected in the duration dialog in the moderator tool for "Alice"

    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the session duration dialog should not be displayed in the open moderator tool for "Alice"
    And the duration field in the open moderator tool for "Alice" should be set to "Unlimited Time"

    When "Alice" selects "5 min" duration in the duration dialog in the moderator tool
    Then the "5 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "5 min"

    When "Alice" selects "10 min" duration in the duration dialog in the moderator tool
    Then the "10 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "10 min"

    When "Alice" selects "15 min" duration in the duration dialog in the moderator tool
    Then the "15 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "15 min"

    When "Alice" selects "30 min" duration in the duration dialog in the moderator tool
    Then the "30 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "30 min"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" selects "Custom" duration in the duration dialog in the moderator tool
    Then the "Custom" duration should be selected in the duration dialog in the moderator tool for "Alice"
    And the input box "Enter custom duration (min)" with the value "0" should be displayed in the duration dialog in the moderator tool for "Alice"

    When "Alice" sets "9" as the custom duration in the duration dialog in the moderator tool
    And "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "9 min"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" decrements the custom duration 2 times in the duration dialog in the moderator tool
    And "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "7 min"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" increments the custom duration 2 times in the duration dialog in the moderator tool
    And "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "9 min"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" selects "5 min" duration in the duration dialog in the moderator tool
    And "Alice" closes the session duration dialog in the open moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "9 min"

  @skip-on-webkit
  # skipped in WebKit due to: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/3174
  Scenario Outline: Create Breakout Rooms with random distribution
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/248
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/249
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/256
    Given 3 guests have joined the meeting of "Alice"
    And "Alice" has opened the Breakout Rooms moderator tool
    When "Alice" creates Breakout Rooms with these settings:
      | setting             | value          |
      | Random distribution | enabled        |
      | By number of        | <By number of> |
    And 3 of the participants in the meeting room of "Alice" join the Breakout Rooms
    Then all together 3 participants should be in the Breakout Rooms in the meeting room of "Alice"
    When "Alice" waits for the participants to be allocated to the Breakout Rooms
    Then <Breakout rooms> Breakout Rooms should have been created in the meeting room of "Alice"
    And <Participants> participants should be in the breakout room of "Alice"
    And all together 4 participants should be in the Breakout Rooms in the meeting room of "Alice"
    When "Alice" closes the Breakout Rooms
    And 3 of the participants in the meeting room of "Alice" leave the Breakout Rooms
    Then 3 participants should be in the meeting room of "Alice"
    When "Alice" waits for the participants to be moved to the Main Room
    Then 4 participants should be in the meeting room of "Alice"
    Examples:
      | By number of | Breakout rooms | Participants |
      | Rooms        | 1              | 4            |
      | Participants | 4              | 1            |

  @skip-on-webkit
  # skipped in WebKit due to: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/3174
  Scenario: Moderator can set participants per room
    # https://git.opentalk.dev/opentalk/qa/todo/-/work_items/563
    Given 7 guests have joined the meeting of "Alice"
    And "Alice" has opened the Breakout Rooms moderator tool
    When "Alice" creates Breakout Rooms with these settings:
      | setting             | value        |
      | Random distribution | enabled      |
      | By number of        | Participants |
      | Min. participants   | 4            |
    And 8 of the participants in the meeting room of "Alice" join the Breakout Rooms
    Then all together 8 participants should be in the Breakout Rooms in the meeting room of "Alice"
    And 2 Breakout Rooms should have been created in the meeting room of "Alice"
    And 4 participants should be in the breakout room of "Alice"


  Scenario Outline: Moderator creates rooms by number of participants, which results in one room created
    # https://git.opentalk.dev/opentalk/qa/todo/-/work_items/564
    Given 3 guests have joined the meeting of "Alice"
    And "Alice" has opened the Breakout Rooms moderator tool
    When "Alice" tries to create Breakout Rooms with these settings:
      | setting             | value                       |
      | Random distribution | disabled                    |
      | By number of        | Participants                |
      | Min. participants   | <No of participants to set> |
    Then this error message should be shown to "Alice" in the Breakout Rooms moderator tool
      | <Error> |
    And these rooms should be listed as to be created in the Breakout Rooms moderator tool of "Alice"
      | Room 1 (0) |
    And these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value                        |
      | By number of        | Participants                 |
      | Min. participants   | <No of participants expected> |
      | Random distribution | disabled                     |
    Examples:
      | No of participants to set | No of participants expected | Error                                                                               |
      | 4                         | 4                          | Some rooms have fewer than the minimum participants required (at least 4 per room). |
      | 5                         | 4                          | Some rooms have fewer than the minimum participants required (at least 4 per room). |
      | 0                         | 1                          | Some rooms have fewer than the minimum participants required (at least 1 per room). |


  Scenario: Moderator creates rooms by number of participants, which results in multiple rooms created
    # https://git.opentalk.dev/opentalk/qa/todo/-/work_items/564
    Given 3 guests have joined the meeting of "Alice"
    And "Alice" has opened the Breakout Rooms moderator tool
    When "Alice" tries to create Breakout Rooms with these settings:
      | setting             | value        |
      | Random distribution | disabled     |
      | By number of        | Participants |
      | Min. participants   | 2            |
    Then this error message should be shown to "Alice" in the Breakout Rooms moderator tool
      | Some rooms have fewer than the minimum participants required (at least 2 per room). |
    And these rooms should be listed as to be created in the Breakout Rooms moderator tool of "Alice"
      | Room 1 (0) |
      | Room 2 (0) |
    And these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value        |
      | By number of        | Participants |
      | Min. participants   | 2            |
      | Random distribution | disabled     |
