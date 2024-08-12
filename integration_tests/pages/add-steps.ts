export default class AddSteps {
  addStepAutocompleteText = (text: string) => {
    cy.get('#step-input-autocomplete').click()
    cy.get('#step-input-autocomplete').type(text)
  }

  selectStepActors = (values: string[]) => {
    values.forEach(value => {
      cy.get('.govuk-checkboxes').first().contains(value).click()
    })
  }

  saveAndContinue = () => {
    cy.get('button').contains('Save and continue').click()
  }
}
