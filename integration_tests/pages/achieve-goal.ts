export default class AchieveGoal {
  isGoalAchievedRadio = (value: string) => {
    cy.get('input[name="is-goal-achieved-radio"]').check(value)
  }
}
