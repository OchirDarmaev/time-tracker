Feature: Manage projects
  As an admin
  I want to add/remove/mark-suppress projects
  So that users can track time against valid project list

  Scenario: Create a new project
    Given I am an admin
    When I create a new project with a name
    Then the project should be added to the system
    And the project should be active by default

  Scenario: Rename or edit a project
    Given I am an admin
    And a project exists in the system but project is not marked as system project
    When I change the project name
    Then the project details should be updated
    And existing time entries should remain associated with the project
  
  Scenario: Change project color
    Given I am an admin
    And a project exists in the system
    When I change the project color
    Then the project color should be updated
    And existing time entries should remain associated with the project

  Scenario: Soft-suppress a project
    Given I am an admin
    And a project exists in the system
    When I mark the project as suppressed
    Then the project should be hidden from users
    And the project history should be preserved

  Scenario: Hard delete is not available in POC
    Given I am an admin
    When I attempt to delete a project
    Then hard delete functionality should not be available in POC
  

