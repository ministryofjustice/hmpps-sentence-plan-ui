export const selectGoalAutocompleteOption = (text: string, option: number) => {
  cy.get('#goal-name').type(text)
  cy.get(`#goal-name__option--${option}`).click()
}

export const createGoal = (goalType: string) => {
  cy.get(`a[href='/create-goal/${goalType}']`).click()
  cy.url().should('include', `/create-goal/${goalType}`)
}

export const selectOtherAreasOfNeedRadio = (value: string) => {
  cy.get('#other-area-of-need-radio').check(value)
}

export const selectStartWorkingRadio = (value: string) => {
  cy.get('#start-working-goal-radio').check(value)
}

export const selectOtherAreasOfNeed = (values: string[]) => {
  values.forEach(value => {
    cy.get('.govuk-checkboxes').first().contains(value).click()
  })
}

export const selectAchievementDate = (value: string) => {
  cy.get('.govuk-radios').last().contains(value).click()
}

export const selectAchievementDateSomethingElse = (value: string) => {
  cy.get('.govuk-radios').last().contains('Something else').click()
  cy.get('.hmpps-js-datepicker-input').type(value)
}

export const clickButton = (value: string) => {
  cy.get('button').contains(value).click()
}

export const createCompleteGoal = () => {
  cy.createGoal('accommodation')
  cy.selectGoalAutocompleteOption('acc', 0)
  cy.selectOtherAreasOfNeedRadio('No')
  cy.selectStartWorkingRadio('yes')
  cy.selectAchievementDate('In 6 months')
  cy.clickButton('Save without steps')
}
