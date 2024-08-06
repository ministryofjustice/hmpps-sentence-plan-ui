export const selectGoalAutocompleteOption = (text: string, option: number) => {
  cy.get('#goal-name').type(text)
  cy.get(`#goal-name__option--${option}`).click()
}

export const createGoal = (goalType: string) => {
  cy.get(`a[href='/create-goal/${goalType}']`).click()
  cy.url().should('include', `/create-goal/${goalType}`)
}

export const selectOtherAreasOfNeedRadio = (value: string) => {
  cy.get('input[name="other-area-of-need-radio"]').check(value)
}

export const selectStartWorkingRadio = (value: string) => {
  cy.get('input[name="start-working-goal-radio"]').check(value)
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
  cy.contains('button', value).click()
}

export const createCompleteGoal = (value: number) => {
  cy.createGoal('accommodation')
  cy.selectGoalAutocompleteOption('acc', value)
  cy.selectOtherAreasOfNeedRadio('no')
  cy.selectStartWorkingRadio('no')
  cy.clickButton('Save without steps')
}

export const selectFutureGoalsSubNavigation = () => {
  cy.get('.moj-sub-navigation__list > li:nth-child(2)').click()
}
