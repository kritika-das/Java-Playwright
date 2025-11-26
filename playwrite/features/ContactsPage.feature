Feature: Contacts Page
  As an authenticated user
  I want to manage contacts

  # Reference test: converted/tests/ContactsPageTest.ts

  Scenario: Select and create contacts
    Given I am logged in to the application
    When I navigate to the Contacts page
    Then the contacts list should be visible

    When I select contact named "test2 test2"
    Then that contact should be selected

    When I create a new contact with title "<title>", first name "<firstName>", last name "<lastName>", company "<company>"
    Then the new contact should be added to the contacts list
