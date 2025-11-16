Feature: Track time per project
  As a user
  I need to track time for a working day across multiple projects
  So that I can reach 8 hours total per day

  Scenario: Add time entry for a project
    Given I am a user
    When I enter a time entry with:
      | Project | Duration | Comment/Tags |
      | jupiter | 0.5 h    | some comment #infra #setup |
    Then the entry should be saved
    And the running total for the selected day should be displayed

  Scenario: Add multiple time entries per day
    Given I am a user
    And I have already added one time entry today
    When I add another time entry for a different project
    Then both entries should be visible
    And the daily total should include all entries

  Scenario: View all days of current month with hours
    Given I am a user
    When I am on dashboard page
    Then I should see all days of the current month with hours on a monthly calendar view

  Scenario: Navigate to a day in the current month
    Given I am a user
    When I am on dashboard page
    Then I should be able to navigate to any day in the range of the month with one click

  Scenario: See status of hours fulfillment for each day
    Given I am a user
    When I am on dashboard page
    Then I should see the status of hours fulfillment for each day
