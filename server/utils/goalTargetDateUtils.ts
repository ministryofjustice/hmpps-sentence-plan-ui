import { dateToISOFormat } from './utils'

export function getDateOptions(): Date[] {
  const today = new Date()
  return getAchieveDateOptions(today)
}

function getAchieveDateOptions(date: Date, dateOptionsInMonths = [3, 6, 12]) {
  return dateOptionsInMonths.map(option => {
    const achieveDate = new Date(date)
    achieveDate.setMonth(date.getMonth() + option)
    return achieveDate
  })
}

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
