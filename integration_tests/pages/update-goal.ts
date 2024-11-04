export default class UpdateGoal {
  public notesEntry = 'A goal update note'

  createNotes = () => {
    cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
    cy.contains('a', 'Update').click() // click update link
    cy.url().should('include', '/update-goal') // check url is update goal
    cy.get('#more-detail').type(this.notesEntry) // type example note in the field
    cy.get('.govuk-button').contains('Save goal and steps').click() // save goal with note
  }
}
