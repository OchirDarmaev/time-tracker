Feature: Manage users in projects
  As an admin
  I want to add/remove/mark-suppress users in projects
  So that only relevant users appear for each project

  Background:
    Given system projects are always assigned to all users
    And system projects are hidden from the management interface

  # Out of scope for POC
  Scenario: Create a new user
    Given I am an admin
    When I invite a new user with a name and email
    Then the user should be added to the system
    And the user should be active by default
    And the user should be automatically assigned to all system projects

  Scenario: Assign user to project
    Given I am an admin
    And a user exists in the system
    And a custom project exists in the system
    When I assign the user to the project
    Then the user should be associated with the project
    And the user should be able to track time for that project

  Scenario: Remove user from project
    Given I am an admin
    And a user is assigned to a custom project
    When I remove the user from the project
    Then the user should be suppressed (status changed)
    And existing time entries should remain in the system
    And the user's history should be preserved
