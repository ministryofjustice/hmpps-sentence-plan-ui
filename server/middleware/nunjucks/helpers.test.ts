import { formatDate } from './helpers'

describe('formatDate', () => {
  it('returns ISO format for valid date with "iso" format', () => {
    expect(formatDate('1990-01-01', 'iso')).toBe('1990-01-01')
  })

  it('returns simple format for valid date with "simple" format', () => {
    expect(formatDate('1990-01-01', 'simple')).toBe('1 January 1990')
  })

  it('returns simple format for valid date with "simple" format', () => {
    expect(formatDate(null, 'simple')).toBe('')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('invalid-date', 'iso')).toBe('')
  })

  it('returns empty string for empty date string', () => {
    expect(formatDate('', 'iso')).toBe('')
  })

  it('returns simple format for valid date with default format', () => {
    // @ts-expect-error we expect a linting error here, the second argument is intentionally invalid
    expect(formatDate('1990-01-01', 'unknown')).toBe('1 January 1990')
  })
})
