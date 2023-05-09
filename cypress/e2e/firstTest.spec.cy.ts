describe('Test with backend', () => {

  beforeEach('login to the app', () => {
    cy.loginToApplication();
  });

  it('verify correct request and response', () => {

    // intercept api calls
    // use alias, in order to work with this later on
    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles');

    // my solution:
    /*    cy.get('nav a').contains('New Article').click();
        cy.get('form').then(form => {
          cy.wrap(form).find('[formcontrolname="title"]').type('Fantastic title');
          cy.wrap(form).find('[formcontrolname="description"]').type('nothing');
          cy.wrap(form).find('[formcontrolname="body"]').type('I mean ... really ... this article is about nothing at all!!!');
          cy.wrap(form).find('[placeholder="Enter tags"]').type('noTag');
          cy.wrap(form).submit();
        });*/

    // course solution:
    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is the super cool title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    });
  });
});
