export default class UpdateGoalStepStatus {
  selectStepStatus = (position: number, text: string) => {
    cy.get(`#step-status-${position}`).select(text)
  }
}
