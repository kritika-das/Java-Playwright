Feature: Sample flow

  Scenario: Login then search and checkout
    Given I open the application
    When I enter username "alice"
    And I enter password "s3cr3t"
    And I click login
    Then I should be logged in

    When I search "playwright"
    And I select the first result
    And I add to cart
    Then I proceed to checkout
    And I place order
