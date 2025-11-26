Feature: FreeCRM Smoke
  Smoke checks for the converted suite

  # Reference test: converted/tests/FreeCrmTest.ts

  Scenario: Basic smoke check
    Given I open the application at "https://www.freecrm.com"
    Then the application should load successfully
