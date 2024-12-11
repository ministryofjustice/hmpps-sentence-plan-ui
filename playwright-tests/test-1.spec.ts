import { test, expect, Page } from '@playwright/test'
import { createSentencePlan, openSentencePlan } from './sentencePlanSession.setup'

test.describe('Simple create goal test', () => {
  let sentencePlanPage: Page

  test.beforeAll(async () => {
    const sentencePlan = await createSentencePlan()
    sentencePlanPage = await openSentencePlan(sentencePlan.oasysAssessmentPk)
  })

  test('test', async () => {
    await sentencePlanPage.goto('/plan')
    await expect(sentencePlanPage.locator('h1')).toContainText('plan')

    await sentencePlanPage.getByRole('button', { name: 'Create goal' }).click()
    await sentencePlanPage.getByLabel(/What goal should/).click()
    await sentencePlanPage.getByLabel(/What goal should/).fill('This is the goal title')
    await sentencePlanPage.getByLabel('No', { exact: true }).check()
    await sentencePlanPage
      .getByRole('group', { name: /start working on this goal now/ })
      .getByLabel('Yes')
      .check()
    await sentencePlanPage.getByLabel(/In 3 months/).check()
    await sentencePlanPage.getByRole('button', { name: 'Save without steps' }).click()
    await expect(sentencePlanPage.locator('h2')).toContainText('This is the goal title')
    await sentencePlanPage.screenshot({ path: 'test-results/create-goal.png' })
  })
})
