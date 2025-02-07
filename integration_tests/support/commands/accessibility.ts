import { Result } from 'axe-core'

// eslint-disable-next-line import/prefer-default-export
export const checkAccessibility = (injectAxe: boolean = true, disabledRules: string[] = []) => {
  if (injectAxe) {
    cy.injectAxe()
    cy.configureAxe({
      rules: [
        ...disabledRules.map(rule => ({ id: rule, enabled: false })),
        {
          id: 'aria-allowed-attr',
          // Temporary rule until this gets resolved https://github.com/w3c/aria/issues/1404
          // GovUK Frontend issue https://github.com/alphagov/govuk-frontend/issues/979
          matches: (node: Element) => !(node.tagName === 'INPUT' && node.hasAttribute('aria-expanded')),
        },
        {
          id: 'target-size',
          enabled: true,
        },
      ],
    })
  }
  cy.checkA11y(null, null, logViolations)
}

const logViolations = (violations: Result[]) => {
  cy.task(
    'table',
    violations.flatMap(({ id, impact, nodes }) =>
      nodes.map(node => ({
        id,
        impact,
        node: node.html,
      })),
    ),
  )
}
