Feature: Manage users in projects
  As an admin
  I want to add/remove/mark-suppress users in projects
  So that only relevant users appear for each project

  Scenario: Create a new user
    Given I am an admin
    When I invite a new user with a name and email
    Then the user should be added to the system
    And the user should be active by default

  Scenario: Assign user to project
    Given I am an admin
    And a user exists in the system
    And a project exists in the system
    When I assign the user to the project
    Then the user should be associated with the project
    And the user should be able to track time for that project

  Scenario: Remove user from project
    Given I am an admin
    And a user is assigned to a project
    When I remove the user from the project
    Then the user should no longer be associated with the project
    And existing time entries should remain in the system

  Scenario: Mark user inactive in project (soft suppression)
    Given I am an admin
    And a user is assigned to a project
    When I mark the user as inactive in the project
    Then the user should be suppressed from the project
    And the user's history should be preserved
