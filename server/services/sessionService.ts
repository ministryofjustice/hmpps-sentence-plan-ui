import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'
import { Token } from '../@types/Token'

export default class SessionService {
  constructor(
    private readonly request: Express.Request,
    private readonly handoverContextService: HandoverContextService,
    private readonly planService: PlanService,
  ) {}

  setupSession = async () => {
    try {
      this.request.session.handover = await this.handoverContextService.getContext(this.request.user?.token)
      this.request.session.plan = await this.planService.getPlanByOasysAssessmentPk(this.getOasysAssessmentPk())
    } catch (e) {
      Logger.error('Failed to setup session:', e)
      throw Error(e)
    }
  }

  getToken = () => this.request.session.token

  setToken = (token: Token) => {
    this.request.session.token = token
  }

  getOasysAssessmentPk = () => this.request.session.handover?.sentencePlanContext?.oasysAssessmentPk

  getPlanUUID = () => this.request.session.plan?.uuid

  getPrincipalDetails = () => this.request.session.handover?.principal

  getSubjectDetails = () => this.request.session.handover?.subject
}
