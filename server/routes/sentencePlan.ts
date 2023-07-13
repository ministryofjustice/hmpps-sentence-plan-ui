import { Request, type RequestHandler, Response, Router } from 'express'
import { formatISO } from 'date-fns'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { formatDate } from '../utils/utils'
import { Sentence } from '../data/prisonApiClient'
import { InitialAppointment } from '../data/deliusClient'
import { Need as OasysNeed } from '../data/oasysClient'
import logger from '../../logger'

export default function sentencePlanRoutes(router: Router, service: Services): Router {
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  async function loadSentencePlan(id: string) {
    const sentencePlan = await service.sentencePlanClient.getSentencePlan(id)
    const caseDetails = await service.deliusService.getCaseDetails(sentencePlan.crn)
    return { caseDetails, sentencePlan }
  }

  async function errorMessage(text: string, page: string, req: Request, res: Response) {
    res.render(`pages/sentencePlan/${page}`, { ...(await loadSentencePlan(req.params.id)), errorMessage: { text } })
  }

  get('/case/:crn', async function loadCaseSummary(req, res) {
    const { crn } = req.params
    const [caseDetails, { sentencePlans }] = await Promise.all([
      service.deliusService.getCaseDetails(crn),
      service.sentencePlanClient.listSentencePlans(crn),
    ])

    let initialAppointmentDate = 'unknown'
    if (!caseDetails.inCustody) {
      try {
        const initialAppointment = <InitialAppointment>await service.deliusService.getInitialAppointment(crn)
        initialAppointmentDate = formatDate(initialAppointment.appointmentDate)
      } catch (error) {
        initialAppointmentDate = 'Error receiving information from delius integration'
      }
    }

    let arrivalIntoCustodyDate = 'unknown'
    if (caseDetails.nomsNumber !== undefined && caseDetails.inCustody) {
      try {
        const sentence = <Sentence>await service.prisonApiClient.getArrivalIntoCustodyDate(caseDetails.nomsNumber)
        arrivalIntoCustodyDate = formatDate(sentence.sentenceDetail.sentenceStartDate)
      } catch (error) {
        logger.error(error, `Failed to get data from prison api: ${JSON.stringify(error)}`)
        arrivalIntoCustodyDate = 'Error receiving information from prison api'
      }
    }

    res.render('pages/case', {
      caseDetails,
      head: [{ text: 'Date' }, { text: 'Status' }, {}],
      rows: sentencePlans.map(it => [
        { html: `<span title='${it.createdDate}'>${formatDate(it.createdDate)}</span>` },
        { html: `<strong class='moj-badge'>${it.status}</strong>` },
        {
          html: `<a href='/sentence-plan/${it.id}/summary'>View</a> | <a href='/sentence-plan/${it.id}/confirmDelete'>Delete</a>`,
        },
      ]),
      hasDraft: sentencePlans.some(it => it.status === 'Draft'),
      hasActive: sentencePlans.some(it => it.status === 'Active'),
      initialAppointmentDate,
      arrivalIntoCustodyDate,
    })
  })

  get('/case/:crn/create-sentence-plan', async function createSentencePlan(req, res) {
    const { crn } = req.params
    const { id } = await service.sentencePlanClient.createSentencePlan({ crn })
    res.redirect(`/sentence-plan/${id}/summary`)
  })

  get('/sentence-plan/:id/summary', async function loadSentencePlanSummary(req, res) {
    const { id } = req.params
    const [sentencePlan, objectivesList] = await Promise.all([
      service.sentencePlanClient.getSentencePlan(id),
      service.sentencePlanClient.listObjectives(id),
    ])
    const caseDetails = await service.deliusService.getCaseDetails(sentencePlan.crn)
    const objectives = objectivesList.objectives.map((it, i) => ({
      text: `${i + 1}. ${it.description}`,
      href: `./objective/${it.id}/summary`,
      attributes: { 'data-actions': it.actionsCount || 0 },
    }))
    res.render('pages/sentencePlan/summary', { caseDetails, sentencePlan, objectives })
  })

  get('/sentence-plan/:id/engagement-and-compliance', async (req, res) => {
    res.render('pages/sentencePlan/engagementAndCompliance', await loadSentencePlan(req.params.id))
  })

  post('/sentence-plan/:id/engagement-and-compliance', async function updateEngagementAndCompliance(req, res) {
    const { id } = req.params
    const existingSentencePlan = await service.sentencePlanClient.getSentencePlan(id)
    const errorMessages: { [key: string]: { text: string } } = {}
    if (req.body['risk-factors'].length === 0) errorMessages.riskFactors = { text: 'Please enter risk factors' }
    if (req.body['risk-factors'].length > 5000)
      errorMessages.riskFactors = { text: 'Risk factors must be 5000 characters or less' }
    if (req.body['protective-factors'].length === 0)
      errorMessages.protectiveFactors = { text: 'Please enter protective factors' }
    if (req.body['protective-factors'].length > 5000)
      errorMessages.protectiveFactors = { text: 'Protective factors must be 5000 characters or less' }
    if (Object.keys(errorMessages).length > 0) {
      await res.render('pages/sentencePlan/engagementAndCompliance', {
        ...(await loadSentencePlan(req.params.id)),
        errorMessages,
      })
    } else {
      await service.sentencePlanClient.updateSentencePlan({
        ...existingSentencePlan,
        riskFactors: req.body['risk-factors'],
        protectiveFactors: req.body['protective-factors'],
      })
      res.redirect(`/sentence-plan/${id}/summary`)
    }
  })

  get('/sentence-plan/:id/your-decisions', async (req, res) => {
    res.render('pages/sentencePlan/yourDecisions', await loadSentencePlan(req.params.id))
  })

  post('/sentence-plan/:id/your-decisions', async function updatePractitionerComments(req, res) {
    const { id } = req.params
    const practitionerComments = req.body['practitioner-comments']
    if (practitionerComments.length === 0) {
      await errorMessage('Please enter your decisions', 'yourDecisions', req, res)
    } else if (practitionerComments.length > 5000) {
      await errorMessage('Your decisions must be 5000 characters or less', 'yourDecisions', req, res)
    } else {
      const existingSentencePlan = await service.sentencePlanClient.getSentencePlan(id)
      await service.sentencePlanClient.updateSentencePlan({ ...existingSentencePlan, practitionerComments })
      res.redirect(`/sentence-plan/${id}/summary`)
    }
  })

  get('/sentence-plan/:id/individuals-comments', async (req, res) => {
    res.render('pages/sentencePlan/individualsComments', await loadSentencePlan(req.params.id))
  })

  post('/sentence-plan/:id/individuals-comments', async function updateIndividualsComments(req, res) {
    const { id } = req.params
    const individualComments = req.body['individual-comments']
    if (individualComments.length === 0) {
      await errorMessage("Please enter the individual's comments", 'individualsComments', req, res)
    } else if (individualComments.length > 5000) {
      await errorMessage("Individual's comments must be 5000 characters or less", 'individualsComments', req, res)
    } else {
      const existingSentencePlan = await service.sentencePlanClient.getSentencePlan(id)
      await service.sentencePlanClient.updateSentencePlan({ ...existingSentencePlan, individualComments })
      res.redirect(`/sentence-plan/${id}/summary`)
    }
  })

  post('/sentence-plan/:sentencePlanId/delete', async function deleteAction(req, res) {
    const { sentencePlanId } = req.params
    const sentencePlan = await service.sentencePlanClient.getSentencePlan(sentencePlanId)
    const { crn } = sentencePlan
    await service.sentencePlanClient.deleteSentencePlan(sentencePlanId)
    res.redirect(`/case/${crn}`)
  })

  get('/sentence-plan/:sentencePlanId/confirmDelete', async function deleteAction(req, res) {
    const { sentencePlanId } = req.params
    res.render('pages/sentencePlan/confirmDeleteSentencePlan', {
      ...(await loadSentencePlan(sentencePlanId)),
    })
  })

  get('/sentence-plan/:sentencePlanId/confirmDelete', async function deleteAction(req, res) {
    const { sentencePlanId } = req.params
    res.render('pages/sentencePlan/confirmDeleteSentencePlan', {
      ...(await loadSentencePlan(sentencePlanId)),
    })
  })

  async function loadNeeds(crn: string): Promise<OasysNeed[]> {
    const needs = await service.oasysClient.getNeeds(crn)
    return needs.criminogenicNeeds
  }

  get('/sentence-plan/:id/start-review', async (req, res) => {
    const { id } = req.params
    const [sentencePlan, objectivesList] = await Promise.all([
      service.sentencePlanClient.getSentencePlan(id),
      service.sentencePlanClient.listObjectives(id),
    ])

    const caseDetails = await service.deliusService.getCaseDetails(sentencePlan.crn)
    const objectiveIds = objectivesList.objectives?.map(o => o.id)

    const allActions = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const oId of objectiveIds) {
      // eslint-disable-next-line no-await-in-loop
      allActions[oId] = (await service.sentencePlanClient.listActions(id, oId)).actions
    }

    const needTypes = await loadNeeds(sentencePlan.crn)
    const mappedNeeds = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const objective of objectivesList.objectives) {
      mappedNeeds[objective.id] = objective.needs?.map(it => needTypes?.find(nt => nt.key === it.code).description)
    }

    res.render('pages/sentencePlan/review', { sentencePlan, caseDetails, objectivesList, mappedNeeds, allActions })
  })

  get('/sentence-plan/:sentencePlanId/confirmStart', async function startSentencePlan(req, res) {
    const { sentencePlanId } = req.params
    res.render('pages/sentencePlan/confirmStartSentencePlan', {
      ...(await loadSentencePlan(sentencePlanId)),
    })
  })

  post('/sentence-plan/:sentencePlanId/start', async function deleteAction(req, res) {
    const { sentencePlanId } = req.params
    const existingSentencePlan = await service.sentencePlanClient.getSentencePlan(sentencePlanId)
    await service.sentencePlanClient.updateSentencePlan({
      ...existingSentencePlan,
      activeDate: formatISO(new Date()),
    })
    res.redirect(`/case/${existingSentencePlan.crn}`)
  })

  return router
}
