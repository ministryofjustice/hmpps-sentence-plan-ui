import { IsEnum, IsOptional } from 'class-validator'

enum GoalTypes {
  CURRENT = 'current',
  FUTURE = 'future',
  REMOVED = 'removed',
  COMPLETED = 'completed',
}

enum StatusTypes {
  ADDED = 'added',
  CHANGED = 'changed',
  REMOVED = 'removed',
  DELETED = 'deleted',
  ACHIEVED = 'achieved',
}

export default class PlanOverviewQueryModel {
  @IsEnum(GoalTypes)
  @IsOptional()
  type: GoalTypes

  @IsEnum(StatusTypes)
  @IsOptional()
  status: StatusTypes
}
