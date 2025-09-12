# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Breakout Room
  As a moderator
  I want to be able to create breakout rooms
  So that the participants can have discussions in smaller groups

  Scenario: Meeting Room As Moderator Create Breakout Rooms Moderator sidebar tool
    Given "Alice" has logged in
    When "Alice" starts an ad-hoc meeting and joins the meeting as moderator
    And "Alice" opens the breakout rooms moderator tool
    Then the heading in the open moderator tool for "Alice" should be "Breakout Rooms"
    And the "By number of" setting in the breakout rooms moderator tool for "Alice" should have these options:
      | Rooms        |
      | Participants |
