# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

Feature: Meeting Room Voting Room
  As a moderator
  I want to know participants' opinion through voting
  So that I can make the correct decision

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator


  Scenario: Meeting Room As Moderator Voting_Overview+Duration+Back button
    When "Alice" opens the Voting moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Voting"
    And the following description should be displayed in the Voting moderator tool for "Alice":
      """
      There are no votes for this conference at the moment.
      """
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Create new voting |

    When "Alice" starts to create a new vote in the Voting moderator tool
    Then the "sub-heading" in the open moderator tool for "Alice" should be "Create Voting"
    And the duration selection field with "1 min" as default should be displayed in the Create Voting moderator tool for "Alice"
    And "allow abstaining toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"
    And "auto close toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"
    When "Alice" hovers the "auto close toggle" in the Create Voting moderator tool
    Then the tooltip for the "auto close" switch on the Create Voting moderator tool for "Alice" should be:
      """
      Activate or deactivate automatic exit once all votes have been cast
      """
    And "Roll Call" should be selected as voting type in the voting type dropdown in the Create Voting moderator tool for "Alice"
    And these fields should be displayed in the open moderator tool for "Alice":
      | Title    |
      | Subtitle |
      | Topic    |
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Back     |
      | Save     |
      | Continue |

    And "Alice" opens the session duration dialog in the Create Voting moderator tool
    And the heading in the session duration dialog should be "Session Duration" in the Create Voting moderator tool for "Alice"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Unlimited Time |
      | 1 min          |
      | 2 min          |
      | 5 min          |
      | Custom         |
      | Save           |
      | Close          |

    When "Alice" selects "Unlimited Time" duration in the Create Voting moderator tool
    Then the "Unlimited Time" duration should be selected in the Create Voting moderator tool for "Alice"

    When "Alice" saves the selected duration in the Create Voting moderator tool
    Then the session duration dialog should not be displayed in the Create Voting moderator tool for "Alice"
    And the duration field in the Create Voting moderator tool for "Alice" should be set to "Unlimited Time"

    When "Alice" selects "1 min" duration in the Create Voting moderator tool
    Then the "1 min" duration should be selected in the Create Voting moderator tool for "Alice"
    When "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "1 min"

    When "Alice" selects "2 min" duration in the Create Voting moderator tool
    Then the "2 min" duration should be selected in the Create Voting moderator tool for "Alice"
    When "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "2 min"

    When "Alice" selects "5 min" duration in the Create Voting moderator tool
    Then the "5 min" duration should be selected in the Create Voting moderator tool for "Alice"
    When "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "5 min"

    When "Alice" opens the session duration dialog in the Create Voting moderator tool
    And "Alice" selects "Custom" duration in the Create Voting moderator tool
    Then the "Custom" duration should be selected in the Create Voting moderator tool for "Alice"
    And the input box "Enter custom duration (min)" with default value "1" should be displayed in the Create Voting moderator tool for "Alice"

    When "Alice" opens the session duration dialog in the Create Voting moderator tool
    And "Alice" sets "9" as the custom duration in the Create Voting moderator tool
    And "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "9 min"

    When "Alice" opens the session duration dialog in the Create Voting moderator tool
    And "Alice" decrements the custom duration 2 times in the Create Voting moderator tool
    And "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "7 min"

    When "Alice" opens the session duration dialog in the Create Voting moderator tool
    And "Alice" increments the custom duration 2 times in the Create Voting moderator tool
    And "Alice" saves the selected duration in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "9 min"

    When "Alice" opens the session duration dialog in the Create Voting moderator tool
    And "Alice" selects "1 min" duration in the Create Voting moderator tool
    And "Alice" closes the session duration dialog in the Create Voting moderator tool
    Then the duration field in the Create Voting moderator tool for "Alice" should be set to "9 min"

    When "Alice" exits the Create Voting moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Voting"
    And the following description should be displayed in the Voting moderator tool for "Alice":
      """
      There are no votes for this conference at the moment.
      """
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Create new voting |