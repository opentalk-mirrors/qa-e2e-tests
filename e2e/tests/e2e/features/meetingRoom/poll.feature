# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

Feature: Meeting Room - Poll Overview

  As a moderator
  I want to create a poll in the meeting room
  So that I can gather participant's opinion on a specific topic
  #https://git.opentalk.dev/opentalk/qa/reports/-/issues/131

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" has invited "Bob" to meeting "Ad-hoc Meeting"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "Ad-hoc Meeting" created by "Alice"
    And "Bob" has joined the meeting with the title "Ad-hoc Meeting" created by "Alice" with:
      | setting | value    |
      | Audio   | disabled |
    And 1 guest has joined the meeting of "Alice"


  Scenario: Moderator starts and exits poll creation without saving
    #https://git.opentalk.dev/opentalk/qa/reports/-/work_items/133
    When "Alice" opens the Poll Moderator Tool in the meeting room
    Then the "heading" in the open moderator tool for "Alice" should be "Polls"
    And the following description should be displayed in the open moderator tool for "Alice":
      """
      There are no polls for this conference at the moment.
      """

    When "Alice" starts to create a new poll in the open moderator tool
    Then the new poll should have following default settings in the Create Poll moderator tool for "Alice"
      | poll-type       | value |
      | live            | false |
      | multiple choice | false |

    When "Alice" exits the Create Poll moderator tool
    Then no polls should be listed in the open moderator tool for "Alice"
