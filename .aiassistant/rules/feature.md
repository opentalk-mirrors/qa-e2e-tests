---
apply: by file patterns
patterns: *.feature
---

Each acceptance test is a scenario in a feature file in a test suite.
Each feature file describes and tests a particular feature of the software.

# Rules to follow for all .feature files
- The feature file starts with the Feature: keyword, a sentence describing the feature. This is followed by more detail explaining who uses the feature and why, in the format:
``` 
  As a [role]
  I want [feature]
  So that [benefit]
```

example:
```
  As a moderator
  I want to be able to mute participants
  So that I can moderate the meeting effectively without background noise or unwanted interruptions
```
- Each scenario starts with the Scenario: keyword followed by a description of the scenario. Then the steps to execute for that scenario are listed.
- There are 3 types of test steps:
    1. Given steps that get the system into the desired state to start the test (e.g., create users and groups, share some files)
    2. When steps that perform the action under test (e.g., upload a file to a share)
    3. Then steps that verify that the action was successful (e.g., check the HTTP status code, check that other users can access the uploaded file)
- A single scenario should test a single action or logical sequence of actions. So the `Given`, `When` and `Then` steps should come in that order.
- Long features might have multiple iteration `Given`, `When` and `Then`. Still a `Then` step can only follow a `When` step
- If there are multiple `Given`, `When` or `Then` steps, then all steps after the first must start with the keyword `And`. Additionally `Then` steps can also start with a `But`.
- `Given` steps are written in the present-perfect tense. They specify things that "have been done". For example:
    - `Given "Alice" has logged in`
    - `Given "Alice" has started an ad-hoc meeting`
- Given steps should mention the actor that performs the step
- When steps are written in the simple present tense. They specify the action that is being tested. For example:
    - `When "Alice" starts creating a new vote on the Voting moderator tool`
    - `When "Alice" opens the Mute Participants moderator tool`
- Write When steps that state what the user wants to achieve. This helps the test to remain focused on the business need rather than the implementation detail.
- When Steps should describe the intended action the user wants to perform, not how exactly that action is performed. So words like "clicked" have to be avoided.
   - Bad: `When "Alice" clicks on the home button`
   - Good: `When "Alice" navigates to the home page`
- Then steps describe what should be the case if the When step(s) happened successfully. They should contain the word should somewhere in the step text.
- If there are multiple things that should or should not be the case after the When action, multiple Then steps should be created.
- Every Then step has to contain a "should"
- Then steps should not say what the user "sees" but how the application behaves. For example:
    - Bad: `Then "Alice" should see the duration selection field`
    - Good: `Then the duration selection field should be visible for "Alice"`
- Steps should indicate where an action or result happens. e.g. `on the users list page`, `in the meeting room`
