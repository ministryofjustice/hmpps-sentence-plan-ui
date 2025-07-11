export default {
  ABOUT_PERSON: '/about',
  CREATE_GOAL: '/create-goal/:areaOfNeed',
  ADD_STEPS: '/goal/:uuid/add-steps',
  PLAN_OVERVIEW: '/plan',
  VIEW_ACHIEVED_GOAL: '/view-achieved-goal/:uuid',
  VIEW_REMOVED_GOAL: '/view-removed-goal/:uuid',
  GOALS: '/goals',
  GOALS_ORDER: '/goals/:type/:uuid/:operation',
  REMOVE_GOAL: '/remove-goal/:uuid',
  DELETE_GOAL: '/confirm-delete-goal/:uuid',
  UPDATE_GOAL: '/update-goal-steps/:uuid',
  CHANGE_GOAL: '/change-goal/:uuid',
  CONFIRM_ACHIEVE_GOAL: '/confirm-if-achieved/:uuid',
  ACHIEVE_GOAL: '/confirm-achieved-goal/:uuid',
  AGREE_PLAN: '/agree-plan',
  UPDATE_AGREE_PLAN: '/update-agree-plan',
  PLAN_HISTORY: '/plan-history',
  RE_ADD_GOAL: '/confirm-add-goal/:uuid',
  UNSAVED_INFORMATION_DELETED: '/unsaved-information-deleted',
  DATA_PRIVACY: '/close-anything-not-needed-before-appointment',
}
