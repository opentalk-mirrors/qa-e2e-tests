# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Breakout Room
  As a moderator
  I want to be able to create Breakout Rooms
  So that the participants can have discussions in smaller groups


  Scenario: Meeting Room As Moderator Create Breakout Rooms Moderator sidebar tool
    Given "Alice" has logged in
    When "Alice" starts an ad-hoc meeting and joins the meeting as moderator
    And "Alice" opens the Breakout Rooms moderator tool
    Then the heading in the open moderator tool for "Alice" should be "Breakout Rooms"
    And these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | setting             | value           |
      | Duration            | Unlimited Time  |
      | By number of        | Rooms           |
      | Number of rooms     | 2               |
      | Random distribution | disabled        |
    And 2 rooms to be created should be displayed in the Breakout Rooms moderator tool for "Alice"
    And a "Start rooms" button should be displayed in the Breakout Rooms moderator tool for "Alice"
    And the "By number of" setting in the Breakout Rooms moderator tool for "Alice" should have these options:
      | Rooms        |
      | Participants |


  Scenario: Meeting Room As Moderator random distribution option
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    When "Alice" opens the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | Random distribution | disabled |
    When "Alice" enables "Random distribution" in the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | Random distribution | enabled |
    When "Alice" disables "Random distribution" in the Breakout Rooms moderator tool
    Then these settings should be set in the Breakout Rooms moderator tool for "Alice"
      | Random distribution | disabled |

