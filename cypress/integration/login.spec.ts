describe('Login', () => {
  it('should show an error if the email or password are incorrect', () => {
    cy.visit('/login');
    cy.contains('Sign into your account');

    cy.dataTestid('flnc-email-input').type('this-email-does-not-exist@fluenccy.com');
    cy.dataTestid('flnc-password-input').type('password');
    cy.dataTestid('flnc-submit-button').click();

    cy.contains('Email or password are incorrect.');
  });

  it('should log the user in when the email and password are correct', () => {
    cy.dataTestid('flnc-email-input').clear().type('test@fluenccy.com');
    cy.dataTestid('flnc-password-input').clear().type('password');
    cy.dataTestid('flnc-submit-button').click();

    cy.url().should('include', '/dashboard');
  });
});
