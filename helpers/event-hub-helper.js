const{expect} = require ('@playwright/test');
const email = 'amulyavarma21@gmail.com'
const password = 'Test@123'

async function login(page){
 await page.goto('/login');
 await page.getByPlaceholder('you@email.com').fill(email);
 await page.getByLabel('Password').fill(password);
 await page.getByRole('button', {name:'Sign In'}).click();
 await expect(page.getByRole('link',{name: /browse events/i}).first()).toBeVisible();
 //await page.locator('a[href="/events"]').first().click();
}
function getEventCards(page){
return page.getByTestId('event-card');
}
async function parseSeatCount(text){
return parseInt(text, 10);
}
module.exports = {login, getEventCards, parseSeatCount};