export default class AddSteps {
  addStepAutocompleteText = (position: number, text: string) => {
    cy.get(`#step-description-${position}-autocomplete`).type(text)
  }

  putStepAutocompleteText = (position: number, text: string) => {
    cy.get(`#step-description-${position}-autocomplete`).invoke('val', text)
  }

  selectStepActor = (position: number, text: string) => {
    cy.get(`#step-actor-${position}`).select(text)
  }

  getStepActor = (position: number) => {
    return cy.get(`#step-actor-${position}`)
  }

  addAnotherStepButton = () => {
    cy.get('button').contains('Add another step').click()
  }

  saveAndContinue = () => {
    cy.get('button').contains('Save and continue').click()
  }

  AddAnotherStepPressingEnter = (position: number) => {
    cy.get(`#step-description-${position}-autocomplete`).type('{enter}')
  }

  removeStep(position: number) {
    cy.get(`button[value="remove-step-${position}"]`).click()
  }

  clearStep = () => {
    cy.get(`button[value="clear-step-1"]`).click()
  }
}
