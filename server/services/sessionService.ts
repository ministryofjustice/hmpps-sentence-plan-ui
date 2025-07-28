import * as Express from 'express'
import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'
import {AccessMode, Gender} from '../@types/Handover'
import { jwtDecode } from 'jwt-decode'

export default class SessionService {
  constructor(
    private readonly request: Express.Request,
    private readonly handoverContextService: HandoverContextService,
    private readonly planService: PlanService,
  ) {}

  setupSession = async () => {
    try {
      this.request.session.handover = await this.handoverContextService.getContext(this.request.user?.token)

      const subjectCRN = this.getSubjectDetails()?.crn
      if (subjectCRN) {
        await this.request.services.planService.associate(this.getPlanUUID(), subjectCRN)
      }

      if (this.getPlanVersionNumber() != null) {
        this.request.session.plan = await this.planService.getPlanByUuidAndVersionNumber(
          this.getPlanUUID(),
          this.getPlanVersionNumber(),
        )
      } else {
        this.request.session.plan = await this.planService.getPlanByUuid(this.getPlanUUID())
      }
    } catch (e) {
      Logger.error('Failed to setup session:', e)
      throw Error(e)
    }
  }

  setupAuthSession = async () => {
    try {
      const decoded: any = jwtDecode(this.request.user.token)

      this.request.session.handover = {
        assessmentContext: { // Why does SP need to know this?
          oasysAssessmentPk: '', // Isn't this only in the coordinator?
          assessmentVersion: 0
        },
        criminogenicNeedsData: {}, // Aiden?
        handoverSessionId: '', // ??
        principal: { // ??
          identifier: 'X', // This should be a UUID? But is shortened in OAStub.
          displayName: decoded.name, // this.request.user.username is probably not right here
          accessMode: AccessMode.READ_WRITE // Use 'scope' values instead of hardcoding?
        },
        subject: { // nDelius
          crn: 'XYZ12345',
          pnc: '',
          givenName: '',
          familyName: '',
          dateOfBirth: '',
          gender: Gender.NotKnown,
          location: 'PRISON'
        },
        sentencePlanContext: {
          oasysAssessmentPk: '', // Isn't this only in the coordinator?
          planId: '', // Via Jake's CRN API?
          planVersion: null, // null as it isHistoricalPlan (and READ_ONLY) if anything else specified.
        }
      }

      // Failed: TypeError: Cannot read properties of undefined (reading 'identifier') HmppsAuthClient.getSystemClientToken
      // Need to do this AFTER setting principal...
      const deliusData = await this.request.services.infoService.getPopData('XYZ12345').catch((): null => null)
      // deliusData === null ? console.log('No Delius Data') : console.log(deliusData);

      this.request.session.handover.subject = { // nDelius?
        crn: deliusData.crn,
        pnc: deliusData.prc, // Is this the same thing and just a typo? Not present in the returned data from the delius API and is just hardcoded in our SP API. So where do I get this from?
        givenName: deliusData.firstName,
        familyName: deliusData.lastName,
        dateOfBirth: deliusData.doB,
        gender: Gender.NotSpecified, // Handover.Gender and Person.Gender are different :/
        location: 'PRISON' // No location in deliusData, but there is an inCustody field...
      }

      // Currently only the sentences are used from the deliusData, and only on the about page...
      // The rest of the data is from the handover subject (as popData in nunjucksSetup.ts).
      if (this.getPlanVersionNumber() != null) {
        this.request.session.plan = await this.planService.getPlanByUuidAndVersionNumber(
          this.getPlanUUID(),
          this.getPlanVersionNumber(),
        )
      } else {
        this.request.session.plan = (await this.planService.getPlanByCrn('XYZ12345'))[0]
        this.request.session.handover.sentencePlanContext.planId = this.request.session.plan.uuid
      }
    } catch (e) {
      Logger.error('Failed to setup session:', e)
      throw Error(e)
    }
  }

  getPlanUUID = () => this.request.session.handover?.sentencePlanContext.planId

  getPlanVersionNumber = () => this.request.session.handover?.sentencePlanContext.planVersion

  getPrincipalDetails = () => this.request.session.handover?.principal

  getSubjectDetails = () => this.request.session.handover?.subject

  getAccessMode = () => {
    const isReadOnlyUser = this.getPrincipalDetails().accessMode === AccessMode.READ_ONLY
    const isHistoricalPlan = this.getPlanVersionNumber() !== null

    if (isReadOnlyUser || isHistoricalPlan) {
      return AccessMode.READ_ONLY
    }

    return AccessMode.READ_WRITE
  }

  getOasysReturnUrl = () => this.request.session.handover?.principal.returnUrl

  getCriminogenicNeeds = () => this.request.session.handover?.criminogenicNeedsData

  getReturnLink = () => this.request.session.returnLink

  setReturnLink = (returnLink: string) => {
    this.request.session.returnLink = returnLink
  }
}
