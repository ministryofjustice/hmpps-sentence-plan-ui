export default class AddSteps {
  addStepAutocompleteText = (text: string) => {
    cy.get('#step-description-1-autocomplete').type(text)
  }

  selectStepActor = (text: string) => {
    cy.get('#step-actor-1').select(text)
  }

  saveAndContinue = () => {
    cy.get('button').contains('Save and continue').click()
  }
}
