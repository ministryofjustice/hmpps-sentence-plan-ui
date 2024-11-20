import GoalDateMustBeTodayOrFuture from './GoalDateMustBeTodayOrFuture'

describe('GoalDateMustBeTodayOrFuture', () => {
  const validator = new GoalDateMustBeTodayOrFuture()

  const oneDay = 1000 * 60 * 60 * 24

  function formatDateAsInput(futureDate: Date): string {
    return `${futureDate.getDate()}/${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`
  }

  it('returns true for a date in the future', () => {
    const futureDate = new Date(Date.now() + oneDay)
    const futureInput = formatDateAsInput(futureDate)
    expect(validator.validate(futureInput)).toBe(true)
  })

  it('returns false for a date in the past', () => {
    const pastDate = new Date(Date.now() - oneDay)
    const pastInput = formatDateAsInput(pastDate)
    expect(validator.validate(pastInput)).toBe(false)
  })

  it('returns true for the current date', () => {
    const currentDate = new Date()
    const currentInput = formatDateAsInput(currentDate)
    expect(validator.validate(currentInput)).toBe(true)
  })

  it('returns false for an invalid date string', () => {
    const invalidDate = 'invalid-date'
    expect(validator.validate(invalidDate)).toBe(false)
  })
})
