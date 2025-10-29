describe('Forgot Password', () => {
  it('should show an error if the email is incorrect', () => {
    cy.visit('/forgot-password');
    cy.contains('Reset Password');

    cy.dataTestid('flnc-email-input').type('this-email-does-not-exist@fluenccy.com');
    cy.dataTestid('flnc-submit-button').click();

    cy.contains('Cannot find user with that email.');
  });
});
