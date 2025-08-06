import * as Express from 'express'
import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'
import {AccessMode, AuthType, Gender} from '../@types/Handover'
import { jwtDecode } from 'jwt-decode'
import {JwtPayloadExtended} from "../@types/Token";

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
      const { name, user_uuid }: JwtPayloadExtended = jwtDecode(this.request?.user?.token)

      // @ts-ignore
      this.request.session.handover = {
        principal: {
          identifier: user_uuid,
          displayName: name,
          accessMode: AccessMode.READ_WRITE, // Use 'scope' values instead of hardcoding?
          authType: AuthType.HMPPS_AUTH
        }
      }

      // Failed: TypeError: Cannot read properties of undefined (reading 'identifier') HmppsAuthClient.getSystemClientToken
      // Need to do this AFTER setting principal...
      const deliusData = await this.request.services.infoService.getPopData('X775086').catch((): null => null)
      deliusData.crn = 'X775086'

      this.request.session.handover = {
        assessmentContext: { // Why does SP need to know this?
          oasysAssessmentPk: '', // Isn't this only in the coordinator?
          assessmentVersion: 0
        },
        criminogenicNeedsData: {},
        handoverSessionId: '', // ??
        principal: this.request.session.handover.principal,
        subject: { // nDelius?
          crn: deliusData.crn,
          pnc: 'UNKNOWN PNC',
          givenName: deliusData.firstName,
          familyName: deliusData.lastName,
          dateOfBirth: deliusData.doB,
          gender: Gender.NotSpecified, // Handover.Gender and Person.Gender are different :/
          location: 'COMMUNITY' // No location in deliusData, but there is an inCustody field...
        },
        sentencePlanContext: {
          oasysAssessmentPk: '', // Isn't this only in the coordinator?
          planId: '', // Via Jake's CRN API?
          planVersion: null, // null as it isHistoricalPlan (and READ_ONLY) if anything else specified.
        }
      }

      const subjectCRN = this.getSubjectDetails()?.crn

      // Currently only the sentences are used from the deliusData, and only on the about page...
      // The rest of the data is from the handover subject (as popData in nunjucksSetup.ts).
      if (this.getPlanVersionNumber() != null) {
        this.request.session.plan = await this.planService.getPlanByUuidAndVersionNumber(
          this.getPlanUUID(),
          this.getPlanVersionNumber(),
        )
      } else {
        this.request.session.plan = (await this.planService.getPlanByCrn(subjectCRN))[0]
        this.request.session.handover.sentencePlanContext.planId = this.request.session.plan.uuid
      }

      if (subjectCRN) {
        await this.request.services.planService.associate(this.getPlanUUID(), subjectCRN)
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
