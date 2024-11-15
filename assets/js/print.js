// Function to open all accordion sections and then print
function openAccordionsAndPrint() {
  // Select all accordion section buttons
  const accordionSections = document.querySelectorAll('.govuk-accordion__section-button')

  accordionSections.forEach(button => {
    const isCollapsed = button.getAttribute('aria-expanded') === 'false'

    // If the accordion is collapsed, click the button to expand
    if (isCollapsed) {
      button.click()
    }
  })

  // Open all details components
  const detailsElements = document.querySelectorAll('details')
  detailsElements.forEach(details => {
    if (!details.open) {
      details.open = true
    }
  })

  // Wait for a short moment to ensure all accordions are open, then trigger print
  setTimeout(() => {
    window.print()
  }, 500) // Adjust the delay if necessary
}

// Event listener for the print button
if (document.getElementById('print-button')) {
  document.getElementById('print-button').addEventListener('click', openAccordionsAndPrint)
} else {
  console.log('no print button')
}
