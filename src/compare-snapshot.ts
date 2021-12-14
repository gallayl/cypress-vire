import 'cypress'

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       *
       * @example cy.dataCy('greeting')
       */
      compareWithSnapshotImage(selector: string): void //Chainable<Element>
    }
  }
}

Cypress.Commands.add('compareWithSnapshotImage', { prevSubject: ['element', 'document'] }, (value) => {
  /** */
})
