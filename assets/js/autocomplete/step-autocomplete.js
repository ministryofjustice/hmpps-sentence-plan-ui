import accessibleAutocomplete from 'accessible-autocomplete'

const STEP_AUTOCOMPLETE_WRAPPER_CLASS = 'step-input-autocomplete-wrapper'
const STEP_AUTOCOMPLETE_INPUT_ID = 'step-input-autocomplete'
const AREA_OF_NEED_INPUT_ID = '_areaOfNeed'

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector(`.${STEP_AUTOCOMPLETE_WRAPPER_CLASS}`)) initializeStepInputAutocomplete()
})

async function getStepOptionsByAreaOfNeed(areaOfNeed) {
  const response = await fetch(`/reference-data/areaOfNeed/${areaOfNeed}/steps`)
  const { steps } = await response.json()
  return steps
}

async function initializeStepInputAutocomplete() {
  const areaOfNeed = document.querySelector(`#${AREA_OF_NEED_INPUT_ID}`).value
  const source = await getStepOptionsByAreaOfNeed(areaOfNeed)
  const wrapperElement = document.querySelector(`.${STEP_AUTOCOMPLETE_WRAPPER_CLASS}`)
  const inputElement = document.querySelector(`#${STEP_AUTOCOMPLETE_INPUT_ID}`)
  const defaultValue = inputElement?.value ?? ''
  inputElement.remove()

  accessibleAutocomplete({
    element: wrapperElement,
    id: STEP_AUTOCOMPLETE_INPUT_ID,
    name: 'step-input-autocomplete',
    source,
    minLength: 3,
    defaultValue,
  })
}
