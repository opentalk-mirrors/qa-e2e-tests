# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: GlitchTip_General
   As a user
   I want to send crash report
   So that I can report errors

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator


  Scenario: TC_001_manual report creating & submitting
    When "Alice" opens the "Report a bug" form
    Then for "Alice" the GlitchTip pop-up should be displayed

    When "Alice" closes the GlitchTip pop-up
    Then for "Alice" the GlitchTip pop-up should not be displayed

    And for "Alice" no request should have been sent to GlitchTip

    Given "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" opens the "Report a bug" form
    And "Alice" sends a crash report with these details:
      | name  | email             | description          |
      | Alice | alice@example.org | This is a bug report |
    Then for "Alice" the GlitchTip pop-up should not be displayed
    And for "Alice" sending successful pop-up should be displayed with text "Sending successful!\nYour report has been sent. Thank you for helping us to continuously improve OpenTalk."
    And for "Alice" a request to GlitchTip should have been sent and a response with status code 200 should have been received

    When "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" opens the "Report a bug" form
    And "Alice" sends a crash report
    Then for "Alice" the GlitchTip pop-up should not be displayed
    And for "Alice" sending successful pop-up should be displayed with text "Sending successful!\nYour report has been sent. Thank you for helping us to continuously improve OpenTalk."
    And for "Alice" a request to GlitchTip should have been sent and a response with status code 200 should have been received
