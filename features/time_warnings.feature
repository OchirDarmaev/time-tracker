Feature: Warning for insufficient time
  As a user
  I need to see a warning if my report does not cover 8 hours per day
  Or 8 × number of working days in the current month
  So that I know where I am behind

  Scenario: Show red warning when daily total is less than 8 hours
    Given I am a user
    And I have tracked time for today
    When my daily total is less than 8 hours
    Then I should see a red warning indicator

  Scenario: Show yellow warning when monthly total is insufficient
    Given I am a user
    And I have tracked time for the current month
    When my monthly total is less than workingDays × 8 hours
    Then I should see a yellow warning indicator
    And working days should be calculated as weekdays minus weekends

  Scenario: Calculate working days correctly
    Given I am a user
    When the system provides required monthly hours
    Then working days should count only weekdays (Mon-Fri)
    And holidays should be optional in the calculation
