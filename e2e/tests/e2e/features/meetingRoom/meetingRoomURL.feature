# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
@skip-on-webkit
Feature: Meeting room URL
  As a user
  I want every link to the meeting room be correct
  So that I and other invited participants can easily join
  # https://git.opentalk.dev/opentalk/qa/reports/-/issues/191

  @skip @smoke
  Scenario: TC_002_URL route in Breakout room
    # https://git.opentalk.dev/opentalk/qa/reports/-/issues/193
    Given "Alice" has logged in
    When "Alice" starts an ad-hoc meeting and joins the meeting as moderator
    And 3 guests join the meeting of "Alice"
    Then 4 participants should be in the meeting room of "Alice"
    When "Alice" creates Breakout Rooms with these settings:
      | setting             | value   |
      | Random distribution | enabled |
    And all participants in the meeting room of "Alice" join the Breakout Rooms
    Then 2 participants should be in the breakout room of "Alice"
    And all together 4 participants should be in the Breakout Rooms in the meeting room of "Alice"
    When "Alice" creates a guest link from the more-options menu
    And "Alice" copies the guest link into the clipboard
    Then the content of the clipboard of "Alice" should match "%meeting_url_pattern%"
    When a guest joins the meeting using the link in the clipboard of "Alice"
    And "Alice" closes all open dialogs by pressing Escape 2 times
    Then 2 or 3 participants should be in the meeting room of "Alice"
    And all together 5 participants should be in the Breakout Rooms in the meeting room of "Alice"
    When "Alice" closes the Breakout Rooms
    And all participants in the meeting room of "Alice" leave the Breakout Rooms
    Then 5 participants should be in the meeting room of "Alice"
