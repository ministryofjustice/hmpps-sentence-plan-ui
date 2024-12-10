import { test, expect } from '@playwright/test'
import { createSentencePlan, openSentencePlan } from './sentencePlanSession.setup'

test('test', async () => {
  const sentencePlan = await createSentencePlan()
  const sentencePlanPage = await openSentencePlan(sentencePlan.oasysAssessmentPk)

  await sentencePlanPage.goto('http://localhost:3000/plan')
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
