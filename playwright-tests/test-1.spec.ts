import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:7072/')
  await page.getByLabel('Target service').selectOption('sentence-plan')
  await page.getByRole('button', { name: 'Create handover link' }).click()
  const page1Promise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Open' }).click()
  const page1 = await page1Promise
  await page1.getByRole('button', { name: 'Create goal' }).click()
  await page1.getByLabel(/What goal should/).click()
  await page1.getByLabel(/What goal should/).fill('This is the goal title')
  await page1.getByLabel('No', { exact: true }).check()
  await page1
    .getByRole('group', { name: /start working on this goal now/ })
    .getByLabel('Yes')
    .check()
  await page1.getByLabel(/In 3 months/).check()
  await page1.getByRole('button', { name: 'Save without steps' }).click()
  await expect(page1.locator('h2')).toContainText('This is the goal title')
})
