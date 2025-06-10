// Anything higher than this value is considered high scoring.
// The names of these fields match the CriminogenicNeedsData interface
const assessmentAreaThresholds: Map<string, number> = new Map([
  ['accommodation', 1],
  ['educationTrainingEmployability', 1],
  ['drugMisuse', 0],
  ['alcoholMisuse', 1],
  ['personalRelationshipsAndCommunity', 1],
  ['thinkingBehaviourAndAttitudes', 2],
  ['lifestyleAndAssociates', 1],
])

export default function getAssessmentAreaThreshold(areaName: string): number {
  return assessmentAreaThresholds.get(areaName)
}
