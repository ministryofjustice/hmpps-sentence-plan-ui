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
  const { name, parentElement } = inputElement
  const areaOfNeedElement = document.querySelector(`#${AREA_OF_NEED_INPUT_ID}`)
  const areaOfNeed = areaOfNeedElement ? areaOfNeedElement.value : undefined
  const row = name.split('step-description-')[1]
  const source = await getStepOptionsByAreaOfNeed(areaOfNeed)
  const defaultValue = inputElement ? inputElement.value : ''
  inputElement.remove()

  accessibleAutocomplete({
    element: parentElement,
    name,
    id: `step-description-${row}-autocomplete`,
    source,
    displayMenu: 'overlay',
    minLength: 2,
    showNoOptionsFound: false,
    defaultValue,
  })

  const element = document.getElementById(`step-description-${row}-autocomplete`)
  element.setAttribute('aria-labelledby', 'step-descriptions-label')
}
