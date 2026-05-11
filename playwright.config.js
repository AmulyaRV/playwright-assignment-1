const {defineConfig} = require('@playwright/test');
const baseURL = 'https://eventhub.rahulshettyacademy.com';
module.exports = defineConfig({
    testDir: './tests',
    timeout: 30 * 1000,
    retries: 0,
    use: {
        baseURL: baseURL,
    },
    projects: [
        {
            name: 'chromium',
            use: {browserName: 'chromium'},
        },
        {
            name: 'firefox',
            use: {browserName: 'firefox'},
        },
    ],
});
