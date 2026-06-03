const {test, expect} = require('@playwright/test');
const {login, buildMockEvents, installMockEventRoutes, findEventCardByTitle, parseCurrency} = require('../helpers/event-hub-helper');
test.describe('Test 1 — Mocked events catalog displays controlled data', () => {
  let mockEvents;

  test.beforeEach(async ({ page }) => {
    mockEvents = buildMockEvents();
    await login(page, 'amulyavarma21@gmail.com', 'Test@123');
    await installMockEventRoutes(page, mockEvents);
    await page.goto('/events');
  });

  test('Step1- sign in and open events with mock data active', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
  });

});


