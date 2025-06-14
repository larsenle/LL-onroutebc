describe('Staff Home Screen', () => {
  const wait_time = Cypress.env('wait_time');
  const user_role = Cypress.env('user_role').toLowerCase();
  const roleCompanies = Cypress.env('rolesToCompanies');
  const company_name = roleCompanies[user_role];

// View Queue
function viewQueueAs(user_role, assertionFn) {
  if(user_role !== 'ca' && user_role !== 'pa'){
    if(user_role !== 'ca' && user_role !== 'pa'){
      // TBD
      
  }

  assertionFn();
  }
}

const expectResultViewQueue = () => {
  switch (user_role) {
    case 'pc':
    case 'sa':
    case 'train':
    case 'ctpo':
      expectSuccessViewQueue();
      break;
    default:
      expectFailureViewQueue();
      break;
  }
}

const expectSuccessViewQueue = () => {
  cy.contains('.tab__label', 'Applications In Queue').should('exist');
}

const expectFailureViewQueue = () => {
  cy.contains('.tab__label', 'Applications In Queue').should('not.exist');
}

  // Manage Queue
  function manageQueueAs(user_role, assertionFn) {
    if (user_role !== 'ca' && user_role !== 'pa') {
      // TBD

    }
    assertionFn();
  }

const expectResultManageQueue = () => {
  switch (user_role) {
    case 'pc':
    case 'sa':
    case 'train':
    case 'ctpo':
      expectSuccessManageQueue();
      break;
    default:
      expectFailureManageQueue();
      break;
  }
}

function processNextLink(index = 0) {
  cy.get('.custom-link__link').then(($links) => {
    if (index >= $links.length) return; // End of loop

    cy.wrap($links[index])
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.wait(wait_time);

    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="cancel-claim-application-button"]').length > 0) {
        cy.get('[data-testid="cancel-claim-application-button"]').click();
        processNextLink(index + 1); // Move to the next link
      } else {
        cy.get('button[aria-label="Edit"]').click();
        cy.wait(wait_time);

        cy.get('textarea[name="permitData.applicationNotes"]')
          .clear()
          .type('Additional notes for testing');
        cy.wait(wait_time);

        cy.get('[data-testid="save-application-button"]').click();
        cy.wait(wait_time);

        cy.contains('div.MuiAlert-message', /Application.*updated\./).should('exist');
        cy.wait(wait_time);

        // Stop after successful save — no more recursion
      }
    });
  });
}

const expectSuccessManageQueue = () => {
  cy.contains('.tab__label', 'Applications In Queue').should('exist').click();
      cy.wait(wait_time);

      cy.contains('.tab__label', 'Claimed Applications').should('exist').click();
      cy.wait(wait_time);

      processNextLink();

}

const expectFailureManageQueue = () => {
  cy.contains('div.MuiAlert-message', /Application.*updated\./).should('not.exist');

}


  
  beforeEach(() => {
    cy.loginAs(user_role);
  });

  it('Should View Queue', () => {
    viewQueueAs(user_role, expectResultViewQueue);
  });

  it('Should Manage Queue', () => {
    manageQueueAs(user_role, expectResultManageQueue);
  });

});



