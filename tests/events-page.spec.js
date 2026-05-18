const {test, expect} = require('@playwright/test');
const{login, getEventCards, parseSeatCount} = require('../helpers/event-hub-helper');

test('login and open the Events page', async({page})=>{
await login(page);
await page.getByRole('link',{name: /browse events/i}).first().click();
await expect(page.getByRole('heading',{name: 'Upcoming Events'})).toBeVisible();
})

test('filter events by keyword, category, and city', async({page}) => {
    await login(page);
    await page.getByRole('link',{name: /browse events/i}).first().click();
    await expect(page.getByRole('heading',{name:'Upcoming Events'})).toBeVisible();
    await page.locator('input[placeholder="Search events, venues…"]').fill("World")
    await page.locator('select').first().selectOption('Conference');
    await page.locator('select').nth(1).selectOption('Hyderabad');
    await expect(page.locator('input[placeholder="Search events, venues…"]')).toHaveValue("World")
    await expect(page.locator('select').first()).toHaveValue('Conference');
    await expect(page.locator('select').nth(1)).toHaveValue('Hyderabad');
    const cards = getEventCards(page);
    await expect(cards.first()).toBeVisible();
    await expect(await cards.count()).toBeGreaterThanOrEqual(1);
    const matchingCards = cards.filter({hasText:'World Tech Summit'});
    await expect(matchingCards).toHaveCount(1);
    await expect(matchingCards).toBeVisible();

    const eventTitle = await matchingCards.locator('h3').textContent();
    const eventPriceText = await matchingCards.locator('p', { hasText: '$' }).textContent();
    const eventSeatsText = await matchingCards.locator('span', { hasText: 'seats available' }).textContent();
    expect(eventTitle).toBe('World Tech Summit');
    expect(eventPriceText).toContain('$');
    const seats = await parseSeatCount(eventSeatsText);
    expect(seats).toBeGreaterThan(0);
    await matchingCards.locator('a', { hasText: 'Book Now' }).click();
    await expect(page).toHaveURL(/events/);
    await expect(page.locator('h1')).toHaveText(eventTitle);
    await expect(page.locator('p',{hasText: eventPriceText})).toBeVisible();
})
test('clear filters and verify all events are visible', async({page}) => {
    await login(page);
    await page.getByRole('link',{name: /browse events/i}).first().click();
    await expect(page.getByRole('heading',{name:'Upcoming Events'})).toBeVisible();
    await page.locator('input[placeholder="Search events, venues…"]').fill("");
    await page.locator('select').first().selectOption('');
    await page.locator('select').nth(1).selectOption('');
    const cards = getEventCards(page);
    await expect(cards.count()).toBeGreaterThanOrEqual(3);
    const firstTitle = await cards.first().locator('h3').textContent();
    const lastTitle = await cards.last().locator('h3').textContent();
    const secondTitle = await cards.nth(1).locator('h3').textContent();

    expect(firstTitle).toBeTruthy();
    expect(secondTitle).toBeTruthy();
    expect(lastTitle).toBeTruthy();

   expect(firstTitle).not.toBe(lastTitle);

});