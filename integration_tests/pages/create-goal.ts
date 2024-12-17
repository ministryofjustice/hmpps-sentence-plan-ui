export default class CreateGoal {
  selectGoalAutocompleteOption = (text: string, option: string) => {
    this.addGoalAutoCompletionText(text)
    cy.get('#goal-input-autocomplete__listbox').contains('li', option).click()
  }

  addGoalAutoCompletionText = (text: string) => {
    cy.get('#goal-input-autocomplete').type(text)
  }

  putGoalAutoCompletionText = (text: string) => {
    cy.get('#goal-input-autocomplete').invoke('val', text)
  }

  createGoal = (goalType: string) => {
    cy.get(`.moj-button-group a[href='/create-goal/${goalType}']`).click()
    cy.url().should('include', `/create-goal/${goalType}`)
  }

  selectRelatedAreasOfNeedRadio = (value: string) => {
    cy.get('input[name="related-area-of-need-radio"]').check(value)
  }

  selectStartWorkingRadio = (value: string) => {
    cy.get('input[name="start-working-goal-radio"]').check(value)
  }

  selectRelatedAreasOfNeed = (values: string[]) => {
    values.forEach(value => {
      cy.get('.govuk-checkboxes').first().contains(value).click()
    })
  }

  selectAchievementDate = (value: string) => {
    cy.get('.govuk-radios').last().contains(value).click()
  }

  selectAchievementDateSomethingElse = (value: string) => {
    cy.get('.govuk-radios').last().contains('Set another date').click()
    cy.get('.moj-js-datepicker-input').type(value)
  }

  clickButton = (value: string) => {
    cy.contains('button', value).click()
  }

  createCompleteGoal = (value: number) => {
    this.createGoal('accommodation')
    this.addGoalAutoCompletionText(`Test Accommodation ${value}`)
    this.selectRelatedAreasOfNeedRadio('no')
    this.selectStartWorkingRadio('yes')
    this.selectAchievementDate('In 6 months')
    this.clickButton('Save without steps')
  }

  selectFutureGoalsSubNavigation = () => {
    cy.get('.moj-sub-navigation__list > li').contains('Future goals').click()
  }
}
