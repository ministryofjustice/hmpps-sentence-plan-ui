export default class CreateGoal {
  selectGoalAutocompleteOption = (text: string, option: number) => {
    this.addGoalAutoCompletionText(text)
    cy.get(`#goal-input-autocomplete__option--${option}`).click()
  }

  addGoalAutoCompletionText = (text: string) => {
    cy.get('#goal-input-autocomplete').type(text)
  }

  createGoal = (goalType: string) => {
    cy.get(`a[href='/create-goal/${goalType}']`).click()
    cy.url().should('include', `/create-goal/${goalType}`)
  }

  selectOtherAreasOfNeedRadio = (value: string) => {
    cy.get('input[name="related-area-of-need-radio"]').check(value)
  }

  selectStartWorkingRadio = (value: string) => {
    cy.get('input[name="start-working-goal-radio"]').check(value)
  }

  selectOtherAreasOfNeed = (values: string[]) => {
    values.forEach(value => {
      cy.get('.govuk-checkboxes').first().contains(value).click()
    })
  }

  selectAchievementDate = (value: string) => {
    cy.get('.govuk-radios').last().contains(value).click()
  }

  selectAchievementDateSomethingElse = (value: string) => {
    cy.get('.govuk-radios').last().contains('Something else').click()
    cy.get('.hmpps-js-datepicker-input').type(value)
  }

  clickButton = (value: string) => {
    cy.contains('button', value).click()
  }

  createCompleteGoal = (value: number) => {
    this.createGoal('accommodation')
    this.addGoalAutoCompletionText(`Test Accommodation ${value}`)
    this.selectOtherAreasOfNeedRadio('no')
    this.selectStartWorkingRadio('yes')
    this.selectAchievementDate('In 6 months')
    this.clickButton('Save without steps')
  }

  selectFutureGoalsSubNavigation = () => {
    cy.get('.moj-sub-navigation__list > li').contains('Future goals').click()
  }
}
