Feature: Manage working days and public holidays
  As a manager
  I want to specify working days and public holidays for each month
  So that the system can accurately calculate required monthly hours and track vacation/holiday time

  Scenario: Mark public holidays for a month
    Given I am a manager
    When I mark specific dates as public holidays for a month
    Then those dates should be saved as holidays
    And those dates should be excluded from working days calculation

  Scenario: View working days and holidays for a month
    Given I am a manager
    When I view the calendar for a month
    Then I should see the MonthlyCalendar component displaying the month
    And I should see all working days and public holidays clearly marked
    And days without a defined type should be explicitly shown as "Not Set" and not fallback to any default type
    And I should see day type counts (workdays, holidays, weekends, not set) displayed above the calendar grid

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

  Scenario: View yearly calendar summary
    Given I am a manager
    When I view the calendar management page
    Then I should see the calendar management page with two main components
    And I should see the YearlySummary component on the left side showing totals for each month of the current year
    And the summary should show counts of workdays, holidays, weekends, and not set days for each month
    And not set days should be displayed with a warning indicator
    And I should see the MonthlyCalendar component on the right side showing the current month's calendar grid
