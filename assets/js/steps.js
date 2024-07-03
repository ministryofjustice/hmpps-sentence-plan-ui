import accessibleAutocomplete from './accessible-autocomplete.min.js'
const ops = {
  steps: async () => {
    removeStaticInput(document.querySelector('#step-name'))
    addAutoComplete('step-name', await getSteps())
  },
  goals: async () => {
    removeStaticInput(document.querySelector('#goal-name'))
    addAutoComplete('goal-name', await getGoals())
  }
}
async function getSteps() {
  const areaOfNeed = document.querySelector('#_areaOfNeed').value
  const response = await fetch(`/reference-data/${areaOfNeed}/steps`);
  const { steps } = await response.json();
  return steps
}
async function getGoals() {
  const areaOfNeed = document.querySelector('#_areaOfNeed').value
  const response = await fetch(`/reference-data/${areaOfNeed}/goals`);
  const { steps } = await response.json();
  return steps
}
function removeStaticInput(element) {
  if (element && element.parentNode) element.parentNode.removeChild(element)
}
function addAutoComplete(id, source) {
  accessibleAutocomplete({
    element: document.querySelector('#my-autocomplete-container'), id, source
  })
}
window.addEventListener('DOMContentLoaded', async () => {
  const page = document.querySelector('#page').value
  if (page && ops[page]) ops[page]()
})