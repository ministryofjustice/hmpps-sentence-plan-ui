import accessibleAutocomplete from "accessible-autocomplete";

const GOAL_AUTOCOMPLETE_WRAPPER_CLASS = "goal-input-autocomplete-wrapper"
const GOAL_AUTOCOMPLETE_INPUT_ID = "goal-input-autocomplete"
const AREA_OF_NEED_INPUT_ID = '_areaOfNeed'

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector(`.${GOAL_AUTOCOMPLETE_WRAPPER_CLASS}`)) initializeGoalInputAutocomplete()
})

async function getGoalOptionsByAreaOfNeed(areaOfNeed) {
    const response = await fetch(`/reference-data/areaOfNeed/${areaOfNeed}/goals`)
    const { goals } = await response.json()
    return goals
}

async function initializeGoalInputAutocomplete() {
    const areaOfNeed = document.querySelector(`#${AREA_OF_NEED_INPUT_ID}`)?.value
    const source = await getGoalOptionsByAreaOfNeed(areaOfNeed);
    const wrapperElement = document.querySelector(`.${GOAL_AUTOCOMPLETE_WRAPPER_CLASS}`)
    const inputElement = document.querySelector(`#${GOAL_AUTOCOMPLETE_INPUT_ID}`)
    const defaultValue = inputElement?.value ?? ''
    inputElement.remove()

    accessibleAutocomplete({
        element: wrapperElement,
        id: GOAL_AUTOCOMPLETE_INPUT_ID,
        name: "goal-input-autocomplete",
        source,
        minLength: 3,
        defaultValue
    })
}
