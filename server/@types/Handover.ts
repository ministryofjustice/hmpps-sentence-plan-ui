import { CriminogenicNeedsData } from './Assessment'
import { AuthenticationDetails, SubjectDetails } from './SessionType'

export type HandoverContextData = {
  handoverSessionId: string
  principal: AuthenticationDetails
  subject: SubjectDetails
  assessmentContext: HandoverAssessmentContext
  sentencePlanContext: HandoverSentencePlanContext
  criminogenicNeedsData?: CriminogenicNeedsData
}

export type HandoverAssessmentContext = {
  oasysAssessmentPk: string
  assessmentVersion: number
}

export type HandoverSentencePlanContext = {
  oasysAssessmentPk: string
  planId: string
  planVersion: number
}
