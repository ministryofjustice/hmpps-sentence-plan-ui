context('Header check', () => {
  context('No x-powered-by header', () => {
    it('Health check page is visible and UP', () => {
      cy.request('/health').then(response => {
        expect(response.headers).to.not.have.property('x-powered-by')
      })
    })
  })
})
