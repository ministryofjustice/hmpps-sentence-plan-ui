import {NewGoal} from "../../server/@types/NewGoalType";

export class DataGenerator {
  private static areasOfNeed = ['Accommodation', 'Health and wellbeing', 'Drug use']

  static generateGoal = (): NewGoal => {
    return {
      areaOfNeed: this.getRandomAreaOfNeed(),
      title: "Random goal " + Math.floor(Math.random() * 1000),
      relatedAreasOfNeed: [this.getRandomAreaOfNeed()],
      targetDate: this.getRandomFutureDate()
    }
  }

  static getRandomAreaOfNeed = () => {
    return this.areasOfNeed[Math.floor(Math.random() * this.areasOfNeed.length)]
  }

  static getRandomFutureDate = (rangeInDays = 900) => {
    return new Date(Date.now() + Math.random() * (rangeInDays * 86400 * 1000)).toISOString()
  }
}