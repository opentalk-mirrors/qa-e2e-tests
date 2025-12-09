# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
@skip-on-webkit
Feature: Mute Participants
  As a moderator
  I want to be able to mute participants
  So that I can moderate the meeting effectively without background noise or unwanted interruptions


  Scenario: As Moderator_Mute participants_All button, Selected button
    Given "Alice" has logged in
    And "Alice" has created an unscheduled meeting with the title "with-alice"
    And "Alice" has joined the meeting with the title "with-alice" as moderator
    And 3 guests have joined the meeting with the title "with-alice" created by "Alice" with:
      | Audio | enabled |
    And "Alice" has invited "Bob" to meeting "with-alice"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "with-alice" created by "Alice"
    And "Bob" has joined the meeting with the title "with-alice" created by "Alice" with:
      | Audio | enabled |
    When "Alice" opens the Mute Participants moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Mute participants"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | All      |
      | Selected |
    And a "Search participant" field should be displayed in the open moderator tool for "Alice"
    And these participants should be displayed with checkboxes in the open moderator tool for "Alice":
      | Bob    |
      | guest1 |
      | guest2 |
      | guest3 |
    When "Alice" mutes all participants in the Mute Participants moderator tool
    Then in the meeting of "Alice" these alert notifications should be displayed for the respected users:
      | user   | text                            |
      | Bob    | You were muted by Alice Hansen. |
      | guest1 | You were muted by Alice Hansen. |
      | guest2 | You were muted by Alice Hansen. |
      | guest3 | You were muted by Alice Hansen. |

