# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting room_Coffee break
  As a user
  I want to manage coffee break sessions effectively
  So that I and other participants can return to the meeting room and end coffee breaks as intended
  # https://git.opentalk.dev/opentalk/qa/reports/-/issues/214

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And 1 guest has joined the meeting of "Alice"
    And "Alice" has opened the Coffee break option in the moderator sidebar
    And "Alice" has set "10 min" as the session duration in the moderator tool
    And "Alice" has started a coffee break

  @skip
  Scenario: TC_004_Meeting Room_As Moderator_Coffee break_Start coffee break_Back to the conference+Stop coffee break
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/220
    When "Alice" returns to the conference from the coffee break
    Then the Meeting room view should be displayed for "Alice"
    And the Coffee break popover should be displayed in the meeting room for "Alice" with heading "Coffee break ..."
    And the Coffee break icon should be visible for "Alice" inside the Coffee break popover
    And a label named "Duration" should be displayed for "Alice" inside the Coffee break popover
    And for "Alice" the remaining time should be shown in MM:SS format inside the Coffee break popover
    And the countdown timer should be running for "Alice" inside the Coffee break popover

    When "Alice" stops the coffee break
    Then the Coffee break popover in the Meeting room should be closed for "Alice"
    And in the meeting of "Alice" these alert notifications should be displayed for the respected users:
      | user   | text                      |
      | Alice  | The coffee break is over. |
      | guest1 | The coffee break is over. |
    And the Coffee break layer should not be visible for guest "guest1" in the meeting room of "Alice"
    And the "heading" in the open moderator tool for "Alice" should be "Coffee break"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Start coffee break |
