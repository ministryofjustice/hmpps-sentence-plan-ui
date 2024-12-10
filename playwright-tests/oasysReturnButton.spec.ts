import { test, expect } from '@playwright/test'
import { createSentencePlan, openSentencePlan } from './sentencePlanSession.setup'

test.describe('OASys Return Button', () => {
  let sentencePlanPage

  test.beforeAll(async () => {
    const sentencePlan = await createSentencePlan()
    sentencePlanPage = await openSentencePlan(sentencePlan.oasysAssessmentPk)
  })

  test('should display and reference the return button correctly on the plan overview page', async () => {
    const returnButton = sentencePlanPage.getByRole('button', { name: 'Return to OASys' })
    await expect(returnButton).toBeVisible()
    await expect(returnButton).toHaveAttribute('href', process.env.OASTUB_URL)
  })
})
