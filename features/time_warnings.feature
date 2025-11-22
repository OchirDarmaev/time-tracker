Feature: Warning for insufficient time
  As a user
  I need to see a warning if my report does not cover 8 hours per day
  Or 8 × number of working days in the current month
  So that I know where I am behind

  Scenario: Show red warning when daily total is less than 8 hours
    Given I am a user
    And I have tracked time for today
    When my daily total is less than 8 hours
    Then I should see a red warning indicator on the daily status

  Scenario: Show yellow warning when monthly total is over the expected hours
    Given I am a user
    And I have tracked time for the current month
    When my monthly total is more than expected hours
    Then I should see a yellow warning indicator
    And working days should be calculated as weekdays based on system calendar provided by manager

  Scenario: Calculate expected hours correctly
    Given I am a user
    When the system provides required monthly hours
    Then working days should count only weekdays based on system calendar provided by manager
    And public holidays should represent all public holidays based on system calendar provided by manager
