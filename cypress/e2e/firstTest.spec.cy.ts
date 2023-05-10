describe('Test with backend', () => {

  beforeEach('login to the app', () => {
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'});
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
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    });
  });

  it('intercepting and modifying the request and response', () => {

    /*    cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
          req.body.article.description = 'This is a description 2';
        }).as('postArticles');*/

    cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
      req.reply(res => {
        expect(res.body.article.description).to.equal('This is a description');
        res.body.article.description = 'This is a description 2';
      });
    }).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is a lame title 1');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description 2');
    });
  });

  it('verify popular tags are displayed', () => {

    // my solution:
    /*    cy.get('.tag-list a').then(tag => {
          cy.wrap(tag).contains('cypress');
          cy.wrap(tag).contains('automation');
          cy.wrap(tag).contains('testing');
        });*/

    // course solution:
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing');
  });

  it.skip('verify global feed likes count', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {'articles': [], 'articlesCount': 0});
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'});

    cy.contains('Global Feed').click();

    cy.get('app-article-list button')
      .then(heartList => {
        expect(heartList[0]).to.contain('1');
        expect(heartList[1]).to.contain('5');
      });

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept('POST', `https://api.realworld.io/api/articles/${articleLink}/favorite`, file);
    });

    cy.get('app-article-list button').eq(1).click().should('contain', '6');
  });

  it('delete a new article in a global feed', () => {

    // providing all the data to create new article
    const bodyRequest = {
      'article': {
        'title': 'blabliblub',
        'description': 'nothing',
        'body': '...really',
        'tagList': []
      }
    };

    // posting a new article via cypress
    cy.get('@token').then(token => {

      cy.request({
        url: Cypress.env('apiUrl') + '/api/articles/',
        headers: {'Authorization': 'Token ' + token},
        method: 'POST',
        body: bodyRequest,
      }).then(response => {
        expect(response.status).to.equal(200);
      });

      // UI action to delete newly created article
      cy.contains('Global Feed').click();
      cy.get('.article-preview').first().click();
      cy.get('.article-actions').contains('Delete Article').click();

      // verify that the article created by cypress was successfully deleted
      cy.request({
        url: Cypress.env('apiUrl') + '/api/articles?limit=10&offset=0',
        headers: {'Authorization': 'Token ' + token},
        method: 'GET',
      }).its('body').then(body => {
        console.log(body);
        expect(body.articles[0].title).not.to.equal('blabliblub');
      });

      // UI action to delete articles which were created in cypress test "verify correct request and response"
      cy.contains('Global Feed').click();
      cy.get('h1').contains('This is the super cool title').click();
      cy.get('.article-actions').contains('Delete Article').click();

      cy.contains('Global Feed').click();
      cy.get('h1').contains('This is a lame title 1').click();
      cy.get('.article-actions').contains('Delete Article').click();
    });
  });

});
