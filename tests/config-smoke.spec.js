const {test, expect} = require('@playwright/test');
const { openLoginPage } = require('../helpers/login-helper');
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