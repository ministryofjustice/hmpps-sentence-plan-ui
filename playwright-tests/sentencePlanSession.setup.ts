import { chromium, Page, request } from '@playwright/test'
import dotenv from 'dotenv'
import { AccessMode } from '../server/@types/Handover'
// import { NewGoal } from '../../../server/@types/NewGoalType'
// import { NewStep } from '../../../server/@types/StepType'
// import { AccessMode } from '../../../server/@types/Handover'

// Load environment variables from playwright.env
dotenv.config({ path: 'playwright.env' })

export const createSentencePlan = async () => {
  const oasysAssessmentPk = Math.random().toString().substring(2, 9)

  const apiToken = await getApiToken()
  const context = await request.newContext()
  const response = await context.post(`${process.env.COORDINATOR_API_URL}/oasys/create`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      planType: 'INITIAL',
      userDetails: {
        id: '12345',
        name: 'Playwright',
      },
      oasysAssessmentPk,
    },
  })

  const createResponse = await response.json()
  return {
    plan: {
      uuid: createResponse.sentencePlanId,
    },
    oasysAssessmentPk,
  }
}

export const openSentencePlan = async (
  oasysAssessmentPk: any,
  accessMode = AccessMode.READ_WRITE,
  sentencePlanVersion: string = undefined,
): Promise<Page> => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiToken = await getApiToken()
  const handoverContext = await createHandoverContext(apiToken, oasysAssessmentPk, accessMode, sentencePlanVersion)

  const response = await page.request.post(handoverContext.url, {
    headers: handoverContext.headers,
    data: handoverContext.body,
  })

  const handoverResponse = await response.json()
  await page.goto(`${handoverResponse.handoverLink}?clientId=${process.env.ARNS_HANDOVER_CLIENT_ID}`)

  await page.goto('http://localhost:3000/')
  return page
}

const getApiToken = async () => {
  const apiToken = process.env.API_TOKEN ? JSON.parse(process.env.API_TOKEN) : null

  if (apiToken && apiToken.expiresAt > Date.now() + 2000) {
    return apiToken.accessToken
  }

  const context = await request.newContext({
    httpCredentials: {
      username: process.env.CLIENT_ID,
      password: process.env.CLIENT_SECRET,
    },
  })

  const response = await context.post(`${process.env.HMPPS_AUTH_URL}/auth/oauth/token`, {
    params: {
      grant_type: 'client_credentials',
      username: 'SYSTEM|e2eTests',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const responseBody = await response.json()
  const newApiToken = {
    accessToken: responseBody.access_token,
    expiresAt: Date.now() + responseBody.expires_in * 1000,
  }
  process.env.API_TOKEN = JSON.stringify(newApiToken)
  return newApiToken.accessToken
}

async function createHandoverContext(apiToken: any, oasysAssessmentPk: any, accessMode: any, sentencePlanVersion: any) {
  return {
    url: `${process.env.ARNS_HANDOVER_URL}/handover`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      oasysAssessmentPk,
      sentencePlanVersion,
      user: {
        identifier: 123,
        displayName: 'Cypress User',
        accessMode,
        returnUrl: process.env.OASTUB_URL,
      },
      subjectDetails: {
        crn: 'X123456',
        pnc: '01/123456789A',
        givenName: 'Sam',
        familyName: 'Whitfield',
        dateOfBirth: '1970-01-01',
        gender: 0,
        location: 'COMMUNITY',
        sexuallyMotivatedOffenceHistory: 'NO',
      },
      criminogenicNeedsData: {
        accommodation: {
          accLinkedToHarm: 'NO',
          accLinkedToReoffending: 'YES',
          accStrengths: 'NO',
          accOtherWeightedScore: '6',
          accThreshold: 'YES',
        },
        educationTrainingEmployability: {
          eteLinkedToHarm: 'NO',
          eteLinkedToReoffending: 'YES',
          eteStrengths: 'YES',
          eteOtherWeightedScore: '2',
          eteThreshold: 'YES',
        },
        finance: {
          financeLinkedToHarm: 'NO',
          financeLinkedToReoffending: 'NO',
          financeStrengths: 'NO',
          financeOtherWeightedScore: 'N/A',
          financeThreshold: 'N/A',
        },
        drugMisuse: {
          drugLinkedToHarm: 'NO',
          drugLinkedToReoffending: 'NO',
          drugStrengths: 'NO',
          drugOtherWeightedScore: '0',
          drugThreshold: 'NO',
        },
        alcoholMisuse: {
          alcoholLinkedToHarm: 'NO',
          alcoholLinkedToReoffending: 'YES',
          alcoholStrengths: 'YES',
          alcoholOtherWeightedScore: '3',
          alcoholThreshold: 'YES',
        },
        healthAndWellbeing: {
          emoLinkedToHarm: 'NO',
          emoLinkedToReoffending: 'NO',
          emoStrengths: 'NO',
          emoOtherWeightedScore: 'N/A',
          emoThreshold: 'N/A',
        },
        personalRelationshipsAndCommunity: {
          relLinkedToHarm: 'NO',
          relLinkedToReoffending: 'NO',
          relStrengths: 'NO',
          relOtherWeightedScore: '6',
          relThreshold: 'YES',
        },
        thinkingBehaviourAndAttitudes: {
          thinkLinkedToHarm: 'NO',
          thinkLinkedToReoffending: 'NO',
          thinkStrengths: 'NO',
          thinkOtherWeightedScore: '10',
          thinkThreshold: 'YES',
        },
        lifestyleAndAssociates: {
          lifestyleLinkedToHarm: 'N/A',
          lifestyleLinkedToReoffending: 'N/A',
          lifestyleStrengths: 'N/A',
          lifestyleOtherWeightedScore: '6',
          lifestyleThreshold: 'YES',
        },
      },
    },
  }
}
