Feature: Manage working days and public holidays
  As a manager
  I want to specify working days and public holidays for each month
  So that the system can accurately calculate required monthly hours and track vacation/holiday time

  Scenario: Specify working days for a month
    Given I am a manager
    When I specify the number of working days for a month
    Then the system should save the working days configuration
    And the monthly required hours should be calculated based on working days

  Scenario: Mark public holidays for a month
    Given I am a manager
    When I mark specific dates as public holidays for a month
    Then those dates should be saved as holidays
    And those dates should be excluded from working days calculation

  Scenario: View working days and holidays for a month
    Given I am a manager
    When I view the calendar for a month
    Then I should see all working days and public holidays clearly marked

  Scenario: Default vacation and holiday projects exist
    Given I am an admin
    When the system is initialized
    Then there should be three default projects:
      | Project Name      | Type           |
      | Paid Vacation     | vacation       |
      | Unpaid Vacation   | vacation       |
      | Holiday           | holiday        |
    And these projects should be available for all users

  Scenario: Track time against vacation/holiday projects
    Given I am a user
    And default vacation and holiday projects exist
    When I track time for a vacation or holiday day
    Then I should be able to select from the default vacation/holiday projects
    And the time entry should be saved with the appropriate project
  
  Scenario: View public holidays for a month
    Given I am a user
    When I view the calendar for a month
    Then I should see all public holidays clearly marked

