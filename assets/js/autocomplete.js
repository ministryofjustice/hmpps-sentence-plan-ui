import accessibleAutocomplete from 'accessible-autocomplete/dist/accessible-autocomplete.min'

const ops = {
  steps: async autoInputVal => {
    removeStaticInput(document.querySelector('#step-name'))
    addAutoComplete('step-name', await getSteps(), autoInputVal)
  },
  goals: async autoInputVal => {
    removeStaticInput(document.querySelector('#goal-name'))
    addAutoComplete('goal-name', await getGoals(), autoInputVal)
  },
}
async function getSteps() {
  const areaOfNeed = document.querySelector('#_areaOfNeed').value
  const response = await fetch(`/reference-data/areaOfNeed/${areaOfNeed}/steps`)
  const { steps } = await response.json()
  return steps
}
async function getGoals() {
  const areaOfNeed = document.querySelector('#_areaOfNeed').value
  const response = await fetch(`/reference-data/areaOfNeed/${areaOfNeed}/goals`)
  const { goals } = await response.json()
  return goals
}
function removeStaticInput(element) {
  if (element && element.parentNode) element.parentNode.removeChild(element)
}
function addAutoComplete(id, source, defaultValue) {
  accessibleAutocomplete({
    element: document.querySelector('#my-autocomplete-container'),
    id,
    source,
    minLength: 3,
    defaultValue,
  })
}
window.addEventListener('DOMContentLoaded', async () => {
  const page = document.querySelector('#page')?.value
  const autoInputVal = page === 'goals' ? document.querySelector('#goalAutoInputVal')?.value : ''
  if (page && ops[page]) ops[page](autoInputVal)
})
