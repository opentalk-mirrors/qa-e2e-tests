# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Home
  As a user
  I want to send messages, search messages, and see participants in the meeting room
  So that I can be more interactive in the meeting
  # https://git.opentalk.dev/opentalk/qa/reports/-/issues/110

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" has invited "Bob" to meeting "Ad-hoc Meeting"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "Ad-hoc Meeting" created by "Alice"
    And "Bob" has joined the meeting with the title "Ad-hoc Meeting" created by "Alice" with:
      | setting | value    |
      | Audio   | disabled |

  @smoke
  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the options available in Home option of the Meeting Room
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/115
    When 2 guests join the meeting of "Alice"
    Then for "Alice" the home view of the moderator sidebar should be open on the Meeting-Room-Page
    And for "Alice" these tabs should be displayed in the sidebar on the Meeting-Room-Page:
      | Chat      |
      | People(4) |
      | Messages  |
    And for "Alice" the chat tab should be selected in the sidebar on the Meeting-Room-Page

  @smoke
  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the functionality of Chat option available in Home option of the Meeting Room
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/115
    When 2 guests join the meeting of "Alice"
    Then for "Alice" the chat option should be displayed on the Meeting-Room-Page
    And for "Alice" a search field should be displayed in the chat area on the Meeting-Room-Page
    # moderator and guest1 see participants joined details and only guest2 who joined at last see chat description
    And for "guest2" there should be a description in the chat area of the meeting room of "Alice" saying:
      """
      This is the beginning of your chat history. Nobody has access to the content of your chat except for the people inside the chat.
      """
    And for "Alice" the chat textfield should be displayed on the Meeting-Room-Page
    And for "Alice" there should be these participants listed in the chat as having joined the room on the Meeting-Room-Page:
      | Bob Burton |
      | guest1     |
      | guest2     |
    And for "guest2" no participants details about who joined the call should be displayed in the chat of the meeting room of "Alice"
    # there should be at least a message to check message is still shown for whoever leaves the call and joins back
    When "Alice" types message "Hello" in the chat input textbox on the Meeting-Room-Page
    And "Alice" sends the current chat message on the Meeting-Room-Page
    And "guest2" leaves the meeting room of "Alice"
    And "guest2" joins the meeting of "Alice" as guest
    Then for "guest2" the last message in the chat in the meeting room of "Alice" should be: "Hello"


  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the functionality of Chat input textbox in Chat option available in Home option of the Meeting Room
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/115
    When 2 guests join the meeting of "Alice"
    Then for "Alice" the chat textfield should be displayed on the Meeting-Room-Page
    And for "Alice" the emoji selection button should be displayed in the chat area of the sidebar on the Meeting-Room-Page
    And for "Alice" the textbox named "Chat" should be displayed on the Meeting-Room-Page
    And for "Alice" the chat submit button should be displayed on the Meeting-Room-Page

    When "Alice" opens the emoji picker dialog on the Meeting-Room-Page
    Then for "Alice" the emoji picker dialog should be displayed on the Meeting-Room-Page
    When "Alice" selects the "😃" emoji on the Meeting-Room-Page
    Then for "Alice" the message "😃" should be displayed in the input textbox on the Meeting-Room-Page
    When "Alice" presses the escape button twice on the Meeting-Room-Page
    Then for "Alice" the emoji picker dialog should not be displayed on the Meeting-Room-Page
    When "Alice" sends the current chat message on the Meeting-Room-Page
    Then for "Alice" the last message in the chat should be: "😃" on the Meeting-Room-Page
    And for "Alice" the sent time of the last message in the chat should have the format "HH:MM" on the Meeting-Room-Page
    When "Alice" selects the chat input textbox on the Meeting-Room-Page
    Then for "Alice" the chat label with placeholder text "Type a message" should be displayed on the Meeting-Room-Page
    When "Alice" types message "Hello" in the chat input textbox on the Meeting-Room-Page
    Then for "Alice" the message "Hello" should be displayed in the input textbox on the Meeting-Room-Page
    When "Alice" sends the current chat message on the Meeting-Room-Page
    Then for "Alice" the last message in the chat should be: "Hello" on the Meeting-Room-Page
    And for "Alice" the sent time of the last message in the chat should have the format "HH:MM" on the Meeting-Room-Page
    When "Alice" selects the chat input textbox on the Meeting-Room-Page
    Then for "Alice" the chat label with placeholder text "Type a message" should be displayed on the Meeting-Room-Page
    When "Alice" sends the current chat message on the Meeting-Room-Page
    Then for "Alice" the error message "Error: Empty messages are not allowed" should be displayed below the chat input textbox on the Meeting-Room-Page
    When "Alice" types message "Hi" in the chat input textbox on the Meeting-Room-Page
    Then for "Alice" the error message "Error: Empty messages are not allowed" should not be displayed below the chat input textbox on the Meeting-Room-Page
    And for "Alice" the message "Hi" should be displayed in the input textbox on the Meeting-Room-Page
    When "Alice" sends the current chat message on the Meeting-Room-Page
    Then for "Alice" the last message in the chat should be: "Hi" on the Meeting-Room-Page
    And for "Alice" the sent time of the last message in the chat should have the format "HH:MM" on the Meeting-Room-Page


  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the functionality of Search input textbox in Chat option available in Home option of the Meeting Room
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/115
    Given 2 guests have joined the meeting of "Alice"
    And "Alice" has sent the following messages in the chat on the Meeting-Room-Page:
      | Test12345  |
      | Test       |
      | 12345      |
      | 999Test    |
      | ()TEST     |
      | -debugging |
      | Test___    |
      | ___test    |
      | !!!12345   |
    When "Alice" selects the search in the chat textbox on the Meeting-Room-Page
    Then for "Alice" the search in the chat label with placeholder "Enter a search term" should be displayed on the Meeting-Room-Page
    When "Alice" types "t" in the search in the chat textbox on the Meeting-Room-Page
    Then for "Alice" all the messages that closely match "t" should be displayed in the chat overview on the Meeting-Room-Page
    And for "Alice" the participant name "Alice" should be displayed for each message on the Meeting-Room-Page
    And for "Alice" the message sent time for all messages in the chat on the Meeting-Room-Page should be "HH:MM"
    And the chat messages count for "Alice" should be 6 on the Meeting-Room-Page
    When "Alice" types "2" in the search in the chat textbox on the Meeting-Room-Page
    Then for "Alice" all the messages that closely match "2" should be displayed in the chat overview on the Meeting-Room-Page
    And for "Alice" the participant name "Alice" should be displayed for each message on the Meeting-Room-Page
    And for "Alice" the message sent time for all messages in the chat on the Meeting-Room-Page should be "HH:MM"
    And the chat messages count for "Alice" should be 3 on the Meeting-Room-Page
    When "Alice" closes the search in the chat textbox on the Meeting-Room-Page
    Then for "Alice" search results should be cleared on the Meeting-Room-Page
    And for "Alice" the chat overview should be displayed on the Meeting-Room-Page
    When "Alice" types "a" in the search in the chat textbox on the Meeting-Room-Page
    Then for "Alice" the text "No messages matching the criteria" should be displayed in the chat overview on the Meeting-Room-Page
    And for "Alice" the reset button should be displayed on the Meeting-Room-Page
    When "Alice" resets the searched text in the chat overview on the Meeting-Room-Page
    Then for "Alice" the chat overview should be displayed on the Meeting-Room-Page
    And the chat messages count for "Alice" should be 9 on the Meeting-Room-Page

  @skip-on-webkit @skip
  # skipped because of group filter switch is missing
  Scenario: TC_002_Meeting Room_As Moderator_Home_People option+search+sort+group
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/118
    Given 2 guests have joined the meeting of "Alice" with delay of 30000 milliseconds
    When "Alice" views the participants on the Meeting-Room-Page
    Then for "Alice" these participants should be labeled as guests on the People-Option-Page:
      | guest1 |
      | guest2 |
    And a "Search participant" "field" should be displayed in the open moderator tool for "Alice"
    And a "Sort by" "button" should be displayed in the open moderator tool for "Alice"
    And a "Group filter off" "switch" should be displayed in the open moderator tool for "Alice"
    And 4 participants should be displayed in the open moderator tool for "Alice"
    And for "Alice" the participants joined time should have the format "Joined HH:MM" on the People-Option-Page
    And for "Alice" the audio status for each participant should be displayed on the People-Option-Page

    When "Alice" selects the search participant textbox on the People-Option-Page
    Then for "Alice" the search participant textbox with the placeholder text "John Doe" should be displayed on the People-Option-Page
    When "Alice" types the text "guest" into the search participant textbox on the People-Option-Page
    Then for "Alice" these participants should be listed on the People-Option-Page:
      | guest1     |
      | guest2     |
    When "Alice" clears the typed text in the search participant textbox on the People-Option-Page
    Then the search participant textbox on the People-Option-Page should contain no text for "Alice"
    And 4 participants should be displayed in the open moderator tool for "Alice"
    When "Alice" types the text "Brian" into the search participant textbox on the People-Option-Page
    Then for "Alice" searched results should be empty on the People-Option-Page
    When "Alice" clears the typed text in the search participant textbox on the People-Option-Page
    Then the search participant textbox on the People-Option-Page should contain no text for "Alice"
    And 4 participants should be displayed in the open moderator tool for "Alice"

    When "Alice" shows the possible order selections on the People-Option-Page
    Then these menu items should be displayed on the People-Option-Page for "Alice":
      | Name (A - Z)      |
      | Name (Z - A)      |
      | First Join Time   |
      | Last Join Time    |
      | Last Active       |
      | Raised Hand First |
    When "Alice" orders the participants by "Name (A - Z)" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Ascending" order on the People-Option-Page
    When "Alice" orders the participants by "Name (Z - A)" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Descending" order on the People-Option-Page
    When "Alice" orders the participants by "First Join Time" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "First Join Time" order on the People-Option-Page
    When "Alice" orders the participants by "Last Join Time" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Last Join Time" order on the People-Option-Page
    When "Alice" orders the participants by "Last Active" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Last Active" order on the People-Option-Page
    # participants need to raise the hand first before observing the raise hand first order
    When these participants raise their hands in the Meeting room of "Alice" with delay of 16000 milliseconds:
      | Alice  |
      | Bob    |
      | guest1 |
      | guest2 |
    And "Alice" orders the participants by "Raised Hand First" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Raised Hand First" order on the People-Option-Page
    # lowering the raised hand
    When these participants lower their hands in the Meeting room of "Alice":
      | Alice  |
      | Bob    |
      | guest1 |
      | guest2 |
    And "Alice" orders the participants by "Name (A - Z)" on the People-Option-Page
    Then for "Alice" the participants list should be displayed in "Ascending" order on the People-Option-Page
    When "Alice" presses the escape button twice on the Meeting-Room-Page
    Then for "Alice" order selection dropdown should not be displayed on the People-Option-Page
    And a "Group filter off" "switch" should be displayed in the open moderator tool for "Alice"

    When "Alice" toggles "Group filter off" on the People-Option-Page
    Then a "Group filter on" "switch" should be displayed in the open moderator tool for "Alice"
    # labels are rendered based on config/opentalk-realm.json
    # we currently have different labels from what is mentioned in the test case and this feature might be disabled in future
    And for "Alice" the without group label with expand button should be displayed on the People-Option-Page
    When "Alice" expands the 'without group' section on the People-Option-Page
    Then for "Alice" these participants should be listed on the People-Option-Page:
      | Bob Burton |
      | guest1     |
      | guest2     |
    And for "Alice" the participants joined time should have the format "Joined HH:MM" on the People-Option-Page
    And for "Alice" the audio status for each participant should be displayed on the People-Option-Page

    When "Alice" collapses the 'without group' section on the People-Option-Page
    Then no participants should be listed for "Alice" on the People-Option-Page

    When "Alice" toggles "Group filter on" on the People-Option-Page
    And a "Group filter off" "switch" should be displayed in the open moderator tool for "Alice"
    And 4 participants should be displayed in the open moderator tool for "Alice"
    And for "Alice" the participants joined time should have the format "Joined HH:MM" on the People-Option-Page
    And for "Alice" the audio status for each participant should be displayed on the People-Option-Page

  @skip
  # skipped because of https://git.opentalk.dev/opentalk/frontend/web/web-app/-/work_items/3288
  Scenario: Guest users can send direct messages to other participants from the list in People tab in the Meeting Room
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/122
    Given 2 guests have joined the meeting of "Alice"
    When "Alice" sends a direct message "Hello" to "guest1" on the Meeting-Room-Page
    Then "guest1" should be notified with the following text in the meeting room of "Alice":
      """
      You have a new message
      """
    And for "guest1" the unread message indicator should be displayed in the meeting room of "Alice"
    When "Alice" tries to send an empty message on the Meeting-Room-Page
    Then for "Alice" the error "Error: Empty messages are not allowed" should be displayed on the Meeting-Room-Page
    When "Alice" sends a message "Hi" on the Meeting-Room-Page
    Then for "Alice" "Hi" should be the last message in the chat on the Messages-Page
    When "Alice" searches for "Hi" in the chat on the Meeting-Room-Page
    Then for "Alice" all the messages that closely match "Hi" should be displayed in the chat on the Meeting-Room-Page
    When "Alice" clears the search in the chat on the Meeting-Room-Page
    Then for "Alice" the following messages should be displayed in the chat on the Messages-Page
      | Hello |
      | Hi    |
    When "Alice" searches for "Hey" in the chat on the Meeting-Room-Page
    Then for "Alice" the text "No messages matching the criteria" should be displayed in the chat on the Meeting-Room-Page
    When "Alice" resets the search in the chat on the Meeting-Room-Page
    Then for "Alice" the following messages should be displayed in the chat on the Messages-Page
      | Hello |
      | Hi    |
    When "Alice" navigates to the Messages-Page from the Meeting-Room-Page
    Then for "Alice" the message thread with "guest1" showing the last message "Hi" should be displayed on the Messages-Page
    When "Alice" opens the chat with "guest1" on the Messages-Page
    Then for "Alice" the following messages should be displayed in the chat on the Messages-Page
      | Hello |
      | Hi    |

  @skip-on-webkit # https://git.opentalk.dev/opentalk/qa/reports/-/issues/418#note_438963
  Scenario: Moderator can remove participants and accept them back into the meeting
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/122
    Given 2 guests have joined the meeting of "Alice"
    When "Alice" removes "guest2" from the meeting room
    Then "Alice" should receive a notification containing the following text in the meeting room of "Alice":
      """
      You successfully removed guest2 from the meeting
      """
    And "guest2" should be notified with the following text in the meeting room of "Alice":
      """
      You were removed from the meeting
      """
    And "guest2" should be on the Lobby-Page of the meeting named "Ad-hoc Meeting" created by "Alice"
    When "guest2" tries to rejoin the meeting room of "Alice"
    Then "guest2" should be in the waiting room of the meeting named "Ad-hoc Meeting" created by "Alice"
    And for "Alice" the waiting room indicator should show 1 participant on the Meeting-Room-Page
    When "Alice" accepts the participation of "guest2" into the meeting room
    Then "Alice" should be notified with the following text in the meeting room of "Alice":
      """
      You successfully accepted guest2 in the meeting
      """
    And "guest2" should be on the Meeting-Room-Page of the meeting named "Ad-hoc Meeting" created by "Alice"

  @skip-on-webkit # https://git.opentalk.dev/opentalk/qa/reports/-/issues/418#note_438963
  Scenario: Moderator can move participants to the waiting room and accept them back into the meeting
    # https://git.opentalk.dev/opentalk/qa/reports/-/work_items/122
    Given 2 guests have joined the meeting of "Alice"
    When "Alice" moves "guest2" to the waiting room from the meeting room
    Then "Alice" should be notified with the following text in the meeting room of "Alice":
      """
      The waiting room is activated. The participant has been successfully moved to the waiting room.
      """
    And for "Alice" the waiting room indicator should show 1 participant on the Meeting-Room-Page
    And "guest2" should be notified with the following text in the meeting room of "Alice":
      """
      You have been moved to the waiting room. Please wait for a moment, you will be brought back shortly.
      """
    And "guest2" should be in the waiting room of the meeting named "Ad-hoc Meeting" created by "Alice"
    When "Alice" accepts the participation of "guest2" into the meeting room
    Then "Alice" should be notified with the following text in the meeting room of "Alice":
      """
      You successfully accepted guest2 in the meeting
      """
    And "guest2" should be on the Meeting-Room-Page of the meeting named "Ad-hoc Meeting" created by "Alice"