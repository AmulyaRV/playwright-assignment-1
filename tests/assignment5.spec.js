const { test, expect } = require('@playwright/test');
const { login, buildMockEvents, installMockEventRoutes, findEventCardByTitle, parseCurrency } = require('../helpers/event-hub-helper');
test.describe('Test 1 — Mocked events catalog displays controlled data', () => {
    let mockEvents;
    let hyderabadEvent;
    test.beforeEach(async ({ page }) => {
        mockEvents = buildMockEvents();
        await login(page, 'amulyavarma21@gmail.com', 'Test@123');
        page.on('request', request => {
            if (request.url().includes('api/events')) {
                console.log('API REQUEST:', request.url());
            }
        });
        await installMockEventRoutes(page, mockEvents);
        await page.goto('/events');
    });

    test('Step1- sign in and open events with mock data active', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    });
    test('Step 2 - Verify the page shows only the mocked events', async ({ page }) => {
        await expect(page.getByTestId('event-card')).toHaveCount(4);

        // Verify each mocked event is displayed with correct details
        for (const event of mockEvents) {
            await expect(page.getByText(event.title)).toBeVisible();
        }
        await expect(page.getByText('World Tech Summit')).not.toBeVisible();
        for (const event of mockEvents) {
            const card = findEventCardByTitle(page, event.title);
            const priceText = await card.locator('text=/\\$[\\d,]+/').first().innerText();
            expect(parseCurrency(priceText)).toBe(event.price);
            // await expect(card.getByText(`$${event.price}`)).toBeVisible();
        }
        for (const event of mockEvents) {
            const card = findEventCardByTitle(page, event.title);
            await expect(card.getByText(String(event.availableSeats))).toBeVisible();
        }
        for (const event of mockEvents) {
            const card = findEventCardByTitle(page, event.title);
            await expect(card.getByRole('link', { name: event.title })).toHaveAttribute('href', `/events/${event.id}`);
            await expect(card.getByRole('link', { name: 'Book Now' })).toHaveAttribute('href', `/events/${event.id}`);
        }
    });
    test('Step 3 - Filter mocked events and confirm one match', async ({ page }) => {
        hyderabadEvent = mockEvents.find(e => e.city === 'Hyderabad' && e.category === 'Conference');
        // Type the event title in the search box
        await page.getByPlaceholder(/Search events, venues/i).fill(hyderabadEvent.title);
        await page.locator('select').first().selectOption('Conference');
        // Set City to Hyderabad
        await page.locator('select').nth(1).selectOption('Hyderabad');
        await expect(page.getByTestId('event-card')).toHaveCount(1);
        const card = findEventCardByTitle(page, hyderabadEvent.title);
        await expect(card.getByText(hyderabadEvent.title)).toBeVisible();

        const priceText = await card.locator('text=/\\$[\\d,]+/').first().innerText();
        expect(parseCurrency(priceText)).toBe(hyderabadEvent.price);

        await expect(card.getByText(String(hyderabadEvent.availableSeats))).toBeVisible();
    });
});
test.describe('Test 2 — Filtered mock event detail page matches catalog data', () => {
    let mockEvents;
    let hyderabadEvent;

    test.beforeEach(async ({ page }) => {
        mockEvents = buildMockEvents();
        hyderabadEvent = mockEvents.find(e => e.city === 'Hyderabad' && e.category === 'Conference');
        await login(page, 'amulyavarma21@gmail.com', 'Test@123');
        await installMockEventRoutes(page, mockEvents);
        await page.goto('/events');
        await page.getByPlaceholder(/Search events, venues/i).fill(hyderabadEvent.title);
        await page.locator('select').first().selectOption('Conference');
        await page.locator('select').nth(1).selectOption('Hyderabad');
        await expect(page.getByTestId('event-card')).toHaveCount(1);
        page.on('request', request => {
            console.log('REQUEST:', request.url());
        });

    });
    test('Step 1 — Open the filtered event and verify detail sections', async ({ page }) => {
        // Click Book Now on the filtered card
        const card = findEventCardByTitle(page, hyderabadEvent.title);
        await card.getByRole('link', { name: 'Book Now' }).click();

        // Expected: URL navigates to /events/{matchedMockId}
        await expect(page).toHaveURL(new RegExp(`/events/${hyderabadEvent.id}`));
        await page.waitForLoadState('networkidle');

        // Expected: h1 title matches mock title
        await expect(page.locator('h1')).toContainText(hyderabadEvent.title);
        // Price per ticket matches mock price
        const priceText = await page.locator('text=/\\$[\\d,]+/').first().innerText();
        expect(parseCurrency(priceText)).toBe(hyderabadEvent.price);

        // Venue matches mock venue
        await expect(page.getByText(hyderabadEvent.venue)).toBeVisible();

        // City matches mock city
        await expect(page.getByText(hyderabadEvent.city, { exact: true })).toBeVisible();
        // Available seats match mock seat count
        await expect(page.getByText(String(hyderabadEvent.availableSeats))).toBeVisible();
    });
    test('Step 2 — Verify ticket quantity updates recalculate total correctly', async ({ page }) => {
    const card = findEventCardByTitle(page, hyderabadEvent.title);
    await card.getByRole('link', { name: 'Book Now' }).click();
    await expect(page).toHaveURL(new RegExp(`/events/${hyderabadEvent.id}`));
    await page.waitForLoadState('networkidle');
   await expect(page.locator('#ticket-count')).toHaveText('1');
   // Expected: Total equals mock price for quantity 1
const totalText = await page.locator('text=/\\$[\\d,]+/').last().innerText();
expect(parseCurrency(totalText)).toBe(hyderabadEvent.price * 1);
// Increase ticket quantity to 2
await page.locator('#ticket-count + button').click();

// Expected: Quantity displays 2
await expect(page.locator('#ticket-count')).toHaveText('2');

// Expected: Total equals mock price x 2
const totalText2 = await page.locator('text=/\\$[\\d,]+/').last().innerText();
expect(parseCurrency(totalText2)).toBe(hyderabadEvent.price * 2);

});

});


