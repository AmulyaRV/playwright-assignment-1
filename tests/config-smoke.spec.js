const {test, expect} = require('@playwright/test');
const { openLoginPage } = require('../helpers/login-helper');
/*
 page fixture vs browser context 
 - The page fixture is one ready-to-use browser tab Playwright provides for the test. It comes pre-loaded with a fresh, isolated context and is automatically cleaned up after the test runs.
 - A `browser context` is a separate browser session — like an incognito window. A context can hold multiple pages (tabs) and has its own cookies, localStorage, sessionStorage, and cache.
- A fresh context (created via `browser.newContext()`) starts with completely isolated state — nothing from other contexts (including the fixture's context)  carries over.*/

test('EventHub login page loads', async ({page}) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/EventHub/i);
    await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
})
test('pageficture fills email field', async ({page, browser}) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@email.com').fill('beginner@sample.com');
    await expect(page.getByPlaceholder('you@email.com')).toHaveValue('beginner@sample.com');

    //create a fresh browser context manually to test if the email field is cleared in a new session
    const isolatedContext = await browser.newContext();
    const isolatedPage = await isolatedContext.newPage();
    await isolatedPage.goto('/login');
    await expect(isolatedPage.getByText('Sign in to EventHub')).toBeVisible();
    await expect(isolatedPage.getByPlaceholder('you@email.com')).toHaveValue('');
    await isolatedContext.close();
})