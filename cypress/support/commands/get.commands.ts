Cypress.Commands.add('dataTestid', (value: DataTestidType) => {
  return cy.get(`[data-testid=${value}]`);
});
