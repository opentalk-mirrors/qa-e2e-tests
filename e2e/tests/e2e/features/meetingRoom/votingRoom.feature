# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

Feature: Meeting Room Voting Room
  As a moderator
  I want to know participants' opinion through voting
  So that I can make the correct decision
  # https://git.opentalk.dev/opentalk/qa/reports/-/issues/20

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator


  Scenario: Meeting Room As Moderator Voting_Overview+Duration+Back button
    # https://git.opentalk.dev/opentalk/qa/reports/-/issues/111
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
    And the duration field in the open moderator tool for "Alice" should be set to "1 min"
    And "allow abstaining toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"
    And "auto close toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"
    When "Alice" hovers the "auto close toggle" in the Create Voting moderator tool
    Then the tooltip for the "auto close" switch on the Create Voting moderator tool for "Alice" should be:
      """
      Activate or deactivate automatic exit once all votes have been cast
      """
    And "Roll Call" should be selected as voting type in the Create Voting moderator tool for "Alice"
    And these fields should be displayed in the open moderator tool for "Alice":
      | Title    |
      | Subtitle |
      | Topic    |
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Back     |
      | Save     |
      | Continue |

    When "Alice" opens the session duration dialog in the moderator tool
    Then the heading in the session duration dialog should be "Session Duration" in the open moderator tool for "Alice"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Unlimited Time |
      | 1 min          |
      | 2 min          |
      | 5 min          |
      | Custom         |
      | Save           |
      | Close          |

    When "Alice" selects "Unlimited Time" duration in the duration dialog in the moderator tool
    Then the "Unlimited Time" duration should be selected in the duration dialog in the moderator tool for "Alice"

    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the session duration dialog should not be displayed in the open moderator tool for "Alice"
    And the duration field in the open moderator tool for "Alice" should be set to "Unlimited Time"

    When "Alice" selects "1 min" duration in the duration dialog in the moderator tool
    Then the "1 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "1 min"

    When "Alice" selects "2 min" duration in the duration dialog in the moderator tool
    Then the "2 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "2 min"

    When "Alice" selects "5 min" duration in the duration dialog in the moderator tool
    Then the "5 min" duration should be selected in the duration dialog in the moderator tool for "Alice"
    When "Alice" saves the selected duration in the duration dialog in the moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "5 min"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" selects "Custom" duration in the duration dialog in the moderator tool
    Then the "Custom" duration should be selected in the duration dialog in the moderator tool for "Alice"
    And the input box "Enter custom duration (min)" with the value "1" should be displayed in the duration dialog in the moderator tool for "Alice"

    When "Alice" opens the session duration dialog in the moderator tool
    And "Alice" sets "9" as the custom duration in the duration dialog in the moderator tool
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
    And "Alice" selects "1 min" duration in the duration dialog in the moderator tool
    And "Alice" closes the session duration dialog in the open moderator tool
    Then the duration field in the open moderator tool for "Alice" should be set to "9 min"

    When "Alice" exits the Create Voting moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Voting"
    And the following description should be displayed in the Voting moderator tool for "Alice":
      """
      There are no votes for this conference at the moment.
      """
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Create new voting |


  Scenario: Meeting Room As Moderator Voting Create new voting allow abstaining, auto close toggle buttons, voting type dropdown, Title+Subtitle+Topic text fields
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/151
    When "Alice" opens the Voting moderator tool
    And "Alice" starts to create a new vote in the Voting moderator tool
    Then "allow abstaining toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"

    When "Alice" toggles "Allow Abstaining" in the open moderator tool
    Then "allow abstaining toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"

    When "Alice" toggles "Allow Abstaining" in the open moderator tool
    Then "allow abstaining toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"
    And "auto close toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"

    # BUG: "Auto Close" has no accessible name; so using technical name "autoClose". See issue: https://git.opentalk.dev/opentalk/qa/e2e-tests/-/issues/49
    # needs to be updated after the bug is fixed
    When "Alice" toggles "autoClose" in the open moderator tool
    Then "auto close toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"

    When "Alice" toggles "autoClose" in the open moderator tool
    Then "auto close toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"
    And "Roll Call" should be selected as voting type in the Create Voting moderator tool for "Alice"

    When "Alice" opens the voting type dropdown in the Create Voting moderator tool
    Then these "options" should be displayed in the open moderator tool for "Alice":
      | Roll Call            |
      | Roll Call - by name  |
      | Hidden Vote          |

    When "Alice" selects "Roll Call" option in the open moderator tool
    Then the voting type dropdown should not be displayed in the Create Voting moderator tool for "Alice"
    And "Roll Call" should be selected as voting type in the Create Voting moderator tool for "Alice"

    When "Alice" opens the voting type dropdown in the Create Voting moderator tool
    And "Alice" selects "Roll Call - by name" option in the open moderator tool
    Then the voting type dropdown should not be displayed in the Create Voting moderator tool for "Alice"
    And "Roll Call - by name" should be selected as voting type in the Create Voting moderator tool for "Alice"

    When "Alice" opens the voting type dropdown in the Create Voting moderator tool
    And "Alice" selects "Hidden Vote" option in the open moderator tool
    Then the voting type dropdown should not be displayed in the Create Voting moderator tool for "Alice"
    And "Hidden Vote" should be selected as voting type in the Create Voting moderator tool for "Alice"

    When "Alice" selects the "Title" field in the open moderator tool
    Then the "Title" field with placeholder text "New vote" should be displayed in the open moderator tool for "Alice"

    When "Alice" types text "Dummy Title" in the "Title" field in the open moderator tool
    Then the text "Dummy Title" should be displayed in the "Title" field in the open moderator tool for "Alice"

    When "Alice" selects the "Subtitle" field in the open moderator tool
    Then the "Subtitle" field with placeholder text "Subtitle" should be displayed in the open moderator tool for "Alice"

    When "Alice" types text "Dummy Subtitle" in the "Subtitle" field in the open moderator tool
    Then the text "Dummy Subtitle" should be displayed in the "Subtitle" field in the open moderator tool for "Alice"

    When "Alice" selects the "Topic" field in the open moderator tool
    Then the "Topic" field with placeholder text "What is the vote about?" should be displayed in the open moderator tool for "Alice"

    When "Alice" types text "Dummy Topic" in the "Topic" field in the open moderator tool
    Then the text "Dummy Topic" should be displayed in the "Topic" field in the open moderator tool for "Alice"


  Scenario: Meeting Room_As Moderator_Voting_Create new voting_Save button
    Given "Alice" has invited "Bob" to meeting "Ad-hoc Meeting"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "Ad-hoc Meeting" created by "Alice"
    And "Bob" has joined the meeting with the title "Ad-hoc Meeting" created by "Alice" with:
      | Audio | disabled |
    And 1 guest has joined the meeting of "Alice"
    When "Alice" opens the Voting moderator tool
    And "Alice" starts to create a new vote in the Voting moderator tool
    Then the "sub-heading" in the open moderator tool for "Alice" should be "Create Voting"

    And "allow abstaining toggle" should be switched "ON" in the Create Voting moderator tool for "Alice"
    And "auto close toggle" should be switched "OFF" in the Create Voting moderator tool for "Alice"

    When "Alice" opens the voting type dropdown in the Create Voting moderator tool
    Then these "options" should be displayed in the open moderator tool for "Alice":
      | Roll Call            |
      | Roll Call - by name  |
      | Hidden Vote          |
    When "Alice" selects "Roll Call" option in the open moderator tool
    Then the voting type dropdown should not be displayed in the Create Voting moderator tool for "Alice"
    And "Roll Call" should be selected as voting type in the Create Voting moderator tool for "Alice"

    When "Alice" selects the "Title" field in the open moderator tool
    And "Alice" types text "Dummy Title" in the "Title" field in the open moderator tool
    Then the text "Dummy Title" should be displayed in the "Title" field in the open moderator tool for "Alice"

    When "Alice" selects the "Subtitle" field in the open moderator tool
    And "Alice" types text "Dummy Subtitle" in the "Subtitle" field in the open moderator tool
    Then the text "Dummy Subtitle" should be displayed in the "Subtitle" field in the open moderator tool for "Alice"

    When "Alice" selects the "Topic" field in the open moderator tool
    And "Alice" types text "Dummy Topic" in the "Topic" field in the open moderator tool
    Then the text "Dummy Topic" should be displayed in the "Topic" field in the open moderator tool for "Alice"

    When "Alice" saves the voting in the Create Voting moderator tool
    Then a notification should be displayed in the meeting room of "Alice" with the text "Your vote form was saved successfully"

    When "Alice" exits the Create Voting moderator tool
    Then the "heading" in the open moderator tool for "Alice" should be "Voting"
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Saved Votings |
    When "Alice" creates the following Votes in the open moderator tool:
      | Title                | Subtitle            | Topic   |
      | Budget Approval Vote | Q1 Financial Review | Finance |
      | Team Outing Vote     | Annual Team Event   | HR      |
    Then the saved voting list for "Alice" should be displayed in the following order in the open moderator tool:
      | Title                | Topic        |
      | Dummy Title          | Dummy Topic  |
      | Budget Approval Vote | Finance      |
      | Team Outing Vote     | HR           |
    When "Alice" "collapses" the saved voting section in the open moderator tool
    Then the saved voting list should be hidden for "Alice" in the open moderator tool
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Create new voting |

    When "Alice" "expands" the saved voting section in the open moderator tool
    And "Alice" selects the last voting from the list in the open moderator tool
    Then the following saved voting details should be displayed on the Update Voting screen for "Alice":
      | duration        | 1 min              |
      | allowAbstaining | true               |
      | autoClose       | false              |
      | votingType      | Roll Call          |
      | title           | Team Outing Vote   |
      | subtitle        | Annual Team Event  |
      | topic           | HR                 |
    And this "button" should be displayed in the open moderator tool for "Alice":
      | Back |
    And the "sub-heading" in the open moderator tool for "Alice" should be "Update Voting"
    And these "buttons" should be displayed in the open moderator tool for "Alice":
      | Save     |
      | Continue |
