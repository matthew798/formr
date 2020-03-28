it('Should load with an empty row if no data is provided', () =>{
    cy.visit('http://localhost:63342/formr');

    const editor = cy.window().its('editor');

    editor
        .its('workspace.rows.length')
        .should('equal', 1);
});

it("Should add a row when clicked", () => {
    cy.visit('http://localhost:63342/formr');

    cy.get("#feditor-add-row-button")
        .click();

    const editor = cy.window().its('editor');

    editor
        .its('workspace.rows.length')
        .should('equal', 2);
});

it("Should be empty when clear is clicked", () => {
    cy.visit('http://localhost:63342/formr');

    cy.get("#clearButton").click();

    const editor = cy.window().its('editor');

    editor
        .its('workspace.rows.length')
        .should("equal", 0);
});