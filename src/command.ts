import 'cypress'

export interface CompareSnapshotImageOptions {
  treshold?: number
  fileName?: string
}

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      compareSnapshotImage(selector?: string, options?: CompareSnapshotImageOptions & Cypress.ScreenshotOptions): void
    }
  }
}

Cypress.Commands.add('compareSnapshotImage', { prevSubject: 'optional' }, (selector, options) => {
  const fileName = options?.fileName || ''
  cy.screenshot(fileName, options)
})
