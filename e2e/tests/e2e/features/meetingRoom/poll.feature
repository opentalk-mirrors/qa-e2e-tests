# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

Feature: Meeting Room - Poll Overview

  As a moderator
  I want to create a poll in the meeting room
  So that I can gather participants' opinions on a specific topic
  #https://git.opentalk.dev/opentalk/qa/reports/-/issues/131

  Background:
    Given these users have been created:
      | Alice |
      | Bob   |
    And "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" has invited "Bob" to meeting "Ad-hoc Meeting"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "Ad-hoc Meeting" created by "Alice"
    And "Bob" has joined the meeting with the title "Ad-hoc Meeting" created by "Alice" with:
      | setting | value    |
      | Audio   | disabled |
    And 1 guest has joined the meeting of "Alice"


  Scenario: Moderator starts and exits poll creation without saving
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/133
    When "Alice" opens the Poll Moderator Tool in the meeting room
    Then the "heading" in the open moderator tool for "Alice" should be "Polls"
    And the following description should be displayed in the open moderator tool for "Alice":
      """
      There are no polls for this conference at the moment.
      """

    When "Alice" starts to create a new poll in the open moderator tool
    Then the following settings should be set for "Alice" in the Create Poll moderator tool:
      | setting         | value |
      | live            | false |
      | multiple choice | false |

    When "Alice" exits the Create Poll moderator tool
    Then 0 created poll should be listed in the open moderator tool for "Alice"


  Scenario: Moderator creates and saves a new poll
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/136
    Given "Alice" has opened the Poll Moderator Tool in the meeting room
    And "Alice" has started to create a new poll in the open moderator tool
    Then the following settings should be set for "Alice" in the Create Poll moderator tool:
      | setting         | value |
      | live            | false |
      | multiple choice | false |

    When "Alice" creates a new poll with the following details in the Create Poll moderator tool
      | field        | value     |
      | Topic        | Test Poll |
      | Option 1     | Answer 1  |
      | Option 2     | Answer 2  |
      | Option 3     | Answer 3  |
      | Option 4     | Answer 4  |
    Then "Alice" should be notified with the following text in the meeting room of "Alice":
      """
      Your poll was saved successfully
      """


  Scenario: Created poll is displayed with correct details
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/136
    Given "Alice" has opened the Poll Moderator Tool in the meeting room
    And "Alice" has started to create a new poll in the open moderator tool

    When "Alice" creates a new poll with the following details in the Create Poll moderator tool
      | field        | value     |
      | Topic        | Test Poll |
      | Option 1     | Answer 1  |
      | Option 2     | Answer 2  |
      | Option 3     | Answer 3  |
      | Option 4     | Answer 4  |
    Then 1 created poll should be listed in the open moderator tool for "Alice"
    And these poll details for "Alice" should be displayed in the following order in the open moderator tool:
      | field    | value     |
      | Topic    | Test Poll |

    When "Alice" selects the latest created poll in the open moderator tool
    Then the poll should be displayed with the following details for "Alice"
      | field    | value     |
      | Topic    | Test Poll |
      | Option 1 | Answer 1  |
      | Option 2 | Answer 2  |
      | Option 3 | Answer 3  |
      | Option 4 | Answer 4  |


  Scenario: Moderator updates an existing poll and saves the changes
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/136
    Given "Alice" has opened the Poll Moderator Tool in the meeting room
    And "Alice" has started to create a new poll in the open moderator tool

    When "Alice" creates a new poll with the following details in the Create Poll moderator tool
      | field        | value     |
      | Topic        | Test Poll |
      | Option 1     | Answer 1  |
      | Option 2     | Answer 2  |
      | Option 3     | Answer 3  |
      | Option 4     | Answer 4  |
    And "Alice" selects the latest created poll in the open moderator tool
    And "Alice" updates the currently open poll with the following details in the Create Poll moderator tool
      | field        | value     |
      | Topic        | New Poll  |
      | Option 3     | Answer 5  |
      | Option 4     | Answer 6  |

    And "Alice" selects the latest updated poll in the open moderator tool
    And "Alice" removes the second-to-last poll option in the Create Poll moderator tool
    Then the poll should be displayed with the following details for "Alice"
      | field    | value     |
      | Topic    | New Poll  |
      | Option 1 | Answer 1  |
      | Option 2 | Answer 2  |
      | Option 4 | Answer 6  |