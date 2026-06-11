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
      | setting             | value           |
      | Duration            | Unlimited Time  |
      | By number of        | Rooms           |
   #  | Number of rooms     | 1               |
      | Random distribution | disabled        |
   # And 1 room to be created should be displayed in the Breakout Rooms moderator tool for "Alice"
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
      | setting             | value    |
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

  @skip @skip-on-webkit
  # skipped because of https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/3174
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
    Then 2 Breakout Rooms should have been created in the meeting of "Alice"
    And 2 participants should be in the breakout room of "Alice"
    And all together 4 participants should be in the Breakout Rooms in the meeting room of "Alice"
    When "Alice" closes the Breakout Rooms
    And 3 of the participants in the meeting room of "Alice" leave the Breakout Rooms
    Then 3 participants should be in the meeting room of "Alice"
    When "Alice" waits for the participants to be moved to the Main Room
    Then 4 participants should be in the meeting room of "Alice"
    Examples:
      | By number of |
      | Rooms        |
      | Participants |
