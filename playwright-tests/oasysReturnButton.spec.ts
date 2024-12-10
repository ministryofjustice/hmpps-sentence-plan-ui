import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import { createSentencePlan, openSentencePlan } from './sentencePlanSession.setup'

dotenv.config({ path: 'playwright.env' })

let sentencePlanPage: any

test.beforeAll(async () => {
  const sentencePlan = await createSentencePlan()
  sentencePlanPage = await openSentencePlan(sentencePlan.oasysAssessmentPk)
})

test('Displays and references the button correctly on the plan overview page', async () => {
  const returnButton = await sentencePlanPage.getByRole('button', { name: 'Return to OASys' })
  await expect(returnButton).toBeVisible()
  const buttonHref = await returnButton.getAttribute('href')
  expect(buttonHref).not.toBeNull()
  expect(buttonHref).not.toBe('')
  expect(buttonHref).toBe(process.env.OASTUB_URL)
})
