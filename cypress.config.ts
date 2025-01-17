import {defineConfig} from 'cypress';

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  env: {
    username: '',
    password: '',
    apiUrl: 'https://api.realworld.io'
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  e2e: {
    setupNodeEvents(on, config) {
      const username = process.env.DB_USERNAME;
      const password = process.env.DB_PASSWORD;

 /*     if (!password) {
        throw new Error('missing DB_PASSWORD environment variable');
      }*/

      config.env = {username, password};
      return config;
    },
    baseUrl: 'http://localhost:4200',
  },
});
