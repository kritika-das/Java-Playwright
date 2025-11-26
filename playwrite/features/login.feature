Feature: Login
  As a user
  I want to login to FreeCRM and verify that login works

  # Reference: converted/tests/LoginPageTest.ts

  Scenario Outline: User logs in
    Given I open the application at "https://www.freecrm.com"
    When I enter username "<username>" and password "<password>"
    And I submit the login form
    Then I should be taken to the Home page

    Examples:
      | username | password |
      | naveenk  | test@123 |
