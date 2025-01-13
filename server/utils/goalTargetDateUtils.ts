import { dateToISOFormat } from './utils'

export function getGoalTargetDate(
  canStartWorkingOnGoalNow: string,
  selectedDateOption: string,
  customDate: string,
): string {
  if (canStartWorkingOnGoalNow === 'yes') {
    if (selectedDateOption === 'custom') {
      return dateToISOFormat(customDate)
    }
    return selectedDateOption
  }
  return null
}
