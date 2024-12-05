import accessibleAutocomplete from 'accessible-autocomplete'

const AREA_OF_NEED_INPUT_ID = '_areaOfNeed'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[id^="step-description-"]').forEach(element => {
    initializeStepInputAutocomplete(element)
  })
})

async function getStepOptionsByAreaOfNeed(areaOfNeed) {
  const response = await fetch(`/reference-data/areaOfNeed/${areaOfNeed}/steps`)
  const { steps } = await response.json()
  return steps
}

async function initializeStepInputAutocomplete(inputElement) {
  const { value, name, parentElement } = inputElement
  const areaOfNeed = document.querySelector(`#${AREA_OF_NEED_INPUT_ID}`).value
  const row = name.split('step-description-')[1]
  const source = await getStepOptionsByAreaOfNeed(areaOfNeed)
  inputElement.remove()

  accessibleAutocomplete({
    element: parentElement,
    name,
    id: `step-description-${row}-autocomplete`,
    source,
    displayMenu: 'overlay',
    minLength: 2,
    showNoOptionsFound: false,
    defaultValue: value ?? '',
  })

  const element = document.getElementById(`step-description-${row}-autocomplete`)
  element.setAttribute('aria-labelledby', 'step-descriptions-label')
}
