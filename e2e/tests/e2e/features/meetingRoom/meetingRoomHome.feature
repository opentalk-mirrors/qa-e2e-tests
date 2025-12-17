# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
Feature: Meeting Room Home
  As a user
  I want to send messages, search messages, and see participants in the meeting room
  So that I can be more interactive in the meeting

  Background:
    Given "Alice" has logged in
    And "Alice" has started an ad-hoc meeting and joined the meeting as moderator
    And "Alice" has invited "Bob" to meeting "Ad-hoc Meeting"
    And "Bob" has logged in
    And "Bob" has accepted the invitation for the meeting with the title "Ad-hoc Meeting" created by "Alice"
    And "Bob" has joined the meeting with the title "Ad-hoc Meeting" created by "Alice" with:
      | Audio | disabled |

  @smoke
  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the options available in Home option of the Meeting Room
    When 2 guests join the meeting of "Alice"
    Then for "Alice" the home view of the moderator sidebar should be open on the Meeting-Room-Page
    And for "Alice" these tabs should be displayed in the sidebar on the Meeting-Room-Page:
      | Chat      |
      | People(4) |
      | Messages  |
    And for "Alice" the chat tab should be selected in the sidebar on the Meeting-Room-Page

  @smoke
  Scenario: TC_001_Meeting Room_As Moderator_Home_Chat+Message+Search - verify the functionality of Chat option available in Home option of the Meeting Room
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
