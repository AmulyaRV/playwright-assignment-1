const {test, expect} = require('@playwright/test');
const { openLoginPage } = require('../helpers/login-helper');
test('EventHub login page loads', async ({page}) => {
    await openLoginPage(page);
    await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible();
}
);