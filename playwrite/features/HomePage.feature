Feature: Home Page
  As an authenticated user
  I want to verify the home page elements and navigation

  # Reference test: converted/tests/HomePageTest.ts

  Scenario: Verify home page title and navigate to contacts
    Given I am logged in to the application
    When I verify the home page title
    Then the title should contain "CRMPRO"

    When I switch to the main frame
    And I click the Contacts link
    Then the Contacts page should be displayed
