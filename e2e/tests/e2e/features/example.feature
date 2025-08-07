# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: TC_001_Meeting room_Debriefing_For moderator + registered user

As a moderator
I want to start the debriefing tool
So that I can see the "For moderator" debriefing option

Background:
  Given "Alice" has logged in
  And "Alice" has started an ad-hoc meeting and joined the meeting as moderator

Scenario: start debriefing moderator tool
  When "Alice" clicks on "Debriefing" button
  Then for "Alice" the debriefing option should be displayed

