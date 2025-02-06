import { IsEnum, IsOptional } from 'class-validator'

enum GoalTypes {
  CURRENT = 'current',
  FUTURE = 'future',
  REMOVED = 'removed',
  ACHIEVED = 'achieved',
}

enum StatusTypes {
  ADDED = 'added',
  CHANGED = 'changed',
  REMOVED = 'removed',
  DELETED = 'deleted',
  ACHIEVED = 'achieved',
  STEPS = 'steps',
  GOAL = 'goal',
}

export default class PlanOverviewQueryModel {
  @IsEnum(GoalTypes)
  @IsOptional()
  type: GoalTypes

  @IsEnum(StatusTypes)
  @IsOptional()
  status: StatusTypes
}
