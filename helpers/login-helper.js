const {expect} = require('@playwright/test');
const baseURL = 'https://eventhub.rahulshettyacademy.com';
// Playwright actions like page.goto() and assertions like expect(...).toBeVisible()
// return Promises. We mark the callback `async` and use `await` so each step
// finishes before the next one runs. Without `await`, the test would race ahead
// before pages load or elements render, causing flaky failures and timing issues.
async function openLoginPage(page) {
await page.goto(baseURL+'/login');
await expect(page.getByText('Sign in to EventHub')).toBeVisible();
}
module.exports = {openLoginPage, baseURL};