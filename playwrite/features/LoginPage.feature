Feature: Login Page
  As a user of FreeCRM
  I want to verify the login page features
  So that I can authenticate and access the application

  # Reference test: converted/tests/LoginPageTest.ts

  Scenario: Validate login page title and login
    Given I open the application at "https://www.freecrm.com"
    When I check the page title
    Then the title should contain "Free CRM"

    When I verify the CRM logo is visible
    Then the CRM logo should be displayed

    When I login with username "<username>" and password "<password>"
    Then I should be redirected to the home page
