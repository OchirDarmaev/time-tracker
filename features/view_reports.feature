Feature: View time tracking reports
  As a user
  I want to view a summary report of time tracking and availability for all users
  So that I can see who worked, who didn't work, and who went on vacation

  Scenario: View monthly time tracking report
    Given I am an authenticated user
    When I navigate to the reports page
    Then I should see a table with users as rows and dates as columns
    And the table should show the current month by default
    And I should see month navigation buttons (previous and next)

  Scenario: View work status in report cells
    Given I am viewing the reports page
    When a user has reported time for a day
    Then system projects should be shown in detail (Vacation as "v", Holiday as "h")
    And regular projects should be shown as "w" (work)
    And empty cells should show "-" for unreported required days

  Scenario: View calendar day type colors
    Given I am viewing the reports page
    When I look at the calendar headers
    Then workdays should have a light blue background
    And public holidays should have a red background
    And weekends should have a secondary background color

  Scenario: Navigate between months
    Given I am viewing the reports page
    When I click the previous month button
    Then the report should update to show the previous month
    When I click the next month button
    Then the report should update to show the next month

  Scenario: View missing reports warning
    Given I am viewing the reports page
    When a user has not reported the required 8 hours on a required day (workday or public holiday)
    And the day is in the past
    Then the cell should show "-" to indicate missing report
    And the cell should have a tooltip showing missing hours

  Scenario: View holiday days count mismatch warning
    Given I am viewing the reports page
    When there are public holidays in the month
    And a user has reported a different number of "Holiday" project days than expected
    Then a warning badge (⚠️) should appear next to the user's name
    And the tooltip should show expected vs reported holiday days

  Scenario: View legend
    Given I am viewing the reports page
    Then I should see a legend below the table explaining:
      | Symbol | Meaning                                    |
      | w      | Work (regular projects)                    |
      | v      | Vacation                                   |
      | h      | Holiday                                    |
      | -      | Not reported (required day)                |
      | ⚠️     | Holiday days count mismatch (on user name) |

  Scenario: Report is available to all users
    Given I am an authenticated user with any role
    When I navigate to the reports page
    Then I should be able to view the time tracking report
    And I should see all active users in the report

  Scenario: Compact table display
    Given I am viewing the reports page
    Then the table cells should be compact with slim columns
    And the text should be readable (12px font size)
    And weekday abbreviations should be single lowercase letters (m, t, w, t, f, s, s)
