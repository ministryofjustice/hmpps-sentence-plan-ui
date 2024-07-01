async function getSteps() {
  console.log('loading')
  const url = new URL(document.querySelector('#stepsSrc').src);
  const areaOfNeed = url.searchParams.get('q')
  const response = await fetch(`/reference-data/${areaOfNeed}/steps`);
  const { steps } = await response.json();
  return steps
}

window.addEventListener('load', () => {
  accessibleAutocomplete({
    element: document.querySelector('#stepName'),
    id: 'my-autocomplete', // To match it to the existing <label>.
    source: getSteps()
  })
})