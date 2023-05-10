import {defineConfig} from 'cypress';

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  env: {
    username: 'artem.bondar16@gmail.com',
    password: 'CypressTest1',
    apiUrl: 'https://api.realworld.io'
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4200',
  },
});
