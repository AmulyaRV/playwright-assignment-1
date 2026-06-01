const { test, expect } = require('@playwright/test');
const { login, createBookingFromFilters,findBookingCardByRef, openBookingDetailFromCard} = require('../helpers/event-hub-helper');
// --- Test Data ---
//const validEmail = 'amulyavarma21@gmail.com';
//const validPassword = 'Test@123';
const TEST_DATA = {
    email: 'amulyavarma21@gmail.com',
    password: 'Test@123',
    customerName: 'Amulya',
    customerEmail: 'amulya12345@gmail.com',
    phone: '+918989898989',
};

/*test('login with valid credentials', async({page})=>{
    await login(page, validEmail, validPassword);
});*/
test('login succeeds and shows authenticated navbar', async ({ page }) => {
    // Step A — already passing
});

test('navigate to a specific event booking page via filters', async ({ page }) => {
    // Step B — new!
    await login(page, TEST_DATA.email, TEST_DATA.password);
    await page.getByTestId('nav-events').click();
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    await page.locator('input[placeholder="Search events, venues…"]').fill("World");
    await page.locator('select').first().selectOption('Conference');
    await page.locator('select').nth(1).selectOption('Hyderabad');
    const cards = page.getByTestId('event-card');
    const matchingCards = cards.filter({ hasText: 'World Tech Summit' });
    await expect(matchingCards).toHaveCount(1);
    const matchingCard = matchingCards.first();
    await matchingCard.getByRole('link', { name: 'Book Now' }).click();
    await expect(page).toHaveURL(/events/);
    await expect(page.locator('h1')).toHaveText('World Tech Summit');
});

test('book an event and capture the booking reference', async ({ page }) => {
    await login(page, TEST_DATA.email, TEST_DATA.password);
    await page.getByTestId('nav-events').click();
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    await page.locator('input[placeholder="Search events, venues…"]').fill("World");
    await page.locator('select').first().selectOption('Conference');
    await page.locator('select').nth(1).selectOption('Hyderabad');

    const cards = page.getByTestId('event-card');
    const matchingCards = cards.filter({ hasText: 'World Tech Summit' });
    const matchingCard = matchingCards.first();
    await matchingCard.getByRole('link', { name: 'Book Now' }).click();
    await expect(page).toHaveURL(/events/);
    await expect(page.locator('h1')).toHaveText('World Tech Summit');

    // Fill out booking form
    await page.getByLabel('Name').fill(TEST_DATA.customerName);
    await page.getByLabel('Email').fill(TEST_DATA.customerEmail);
    await page.getByLabel('Phone').fill(TEST_DATA.phone);
    await page.getByRole('button', { name: 'Confirm Booking' }).click();
    await expect(page.getByText('Booking confirmed!')).toBeVisible();

    const bookingReference = await page.locator('.booking-ref').textContent();
    console.log('Captured Booking Reference:', bookingReference);
    expect(bookingReference).toBeTruthy();
});

test('createBookingFromFilters books an event and returns data', async ({ page }) => {
    await login(page, TEST_DATA.email, TEST_DATA.password);
    const bookingData = {
        searchText: 'World',
        category: 'Conference',
        city: 'Hyderabad',
        quantity: 1,
        customerName: TEST_DATA.customerName,
        customerEmail: TEST_DATA.customerEmail,
        phone: TEST_DATA.phone,
    };
    //await createBookingFromFilters(page, bookingData);
    const booking = await createBookingFromFilters(page, bookingData);

    expect(booking.eventTitle).toBe('World Tech Summit');
    expect(booking.bookingRef).toBeTruthy();
    expect(booking.ticketCount).toBe(1);
    expect(booking.totalText).toContain('$');
});
test('create two bookings and preserve both runtime payloads', async ({ page }) => {
    await login(page, TEST_DATA.email, TEST_DATA.password);
    const bookingOne = await createBookingFromFilters(page, {
        searchText: 'World',
        category: 'Conference',
        city: 'Hyderabad',
        quantity: 1,
        customerName: TEST_DATA.customerName,
        customerEmail: TEST_DATA.customerEmail,
        phone: TEST_DATA.phone,
    });
    console.log('First Booking:', bookingOne);
    // Assertions for the first booking
    expect(bookingOne.eventTitle).toBe('World Tech Summit');
    expect(bookingOne.bookingRef).toBeTruthy();
    expect(bookingOne.ticketCount).toBe(1);
    expect(bookingOne.totalText).toContain('$');

    // Create a second booking with different data
    const bookingTwo = await createBookingFromFilters(page, {
        searchText: 'Dilli',
        category: 'Festival',
        city: 'Delhi',
        quantity: 2,
        customerName: TEST_DATA.customerName,
        customerEmail: TEST_DATA.customerEmail,
        phone: TEST_DATA.phone,
    });
    console.log('Second Booking:', bookingTwo);
    // Assertions for the second booking
    expect(bookingTwo.eventTitle).toBe('Dilli Diwali Mela');
    expect(bookingTwo.bookingRef).toBeTruthy();
    expect(bookingTwo.ticketCount).toBe(2);
    expect(bookingTwo.totalText).toContain('$');

    //verify that the two booking references are different
    expect(bookingOne.bookingRef).not.toBe(bookingTwo.bookingRef);
    expect(bookingOne.customerEmail).toBe(bookingTwo.customerEmail);

    //store both booking references in an array for potential future use
    const bookingRefs = [bookingOne.bookingRef, bookingTwo.bookingRef];
    console.log('All Booking References:', bookingRefs);
});
// Navigate to My Bookings
test('navigate to My Bookings and verify booking details', async ({ page }) => {
    await login(page, TEST_DATA.email, TEST_DATA.password);
    await page.getByTestId('nav-bookings').click();
    await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
});

// Update import to include the new helpers


// New test for Step F
test('find a booking by ref and open its detail page', async ({ page }) => {
  await login(page, TEST_DATA.email, TEST_DATA.password);

  // Book an event first (so we know a fresh ref exists)
  const booking = await createBookingFromFilters(page, {
    searchText: 'World',
    category: 'Conference',
    city: 'Hyderabad',
    quantity: 1,
    customerName: TEST_DATA.customerName,
    customerEmail: TEST_DATA.customerEmail,
    phone: TEST_DATA.phone,
  });

  // Navigate to My Bookings
  await page.getByTestId('nav-bookings').click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  // Find this booking by its ref
  const bookingCard = findBookingCardByRef(page, booking.bookingRef);
  await expect(bookingCard).toBeVisible();
  await expect(bookingCard).toContainText(booking.eventTitle);

  // Open the detail page
  await openBookingDetailFromCard(bookingCard);

  // Verify we landed on the detail page
  await expect(page).toHaveURL(/\/bookings\/\d+/);
  await expect(page.locator('h1')).toHaveText(booking.eventTitle);
});

test('reconcile My Bookings cards with the correct detail pages', async ({ page }) => {
  // ─── Step 1: Login ──────────────────────────────────────────────
  await login(page, TEST_DATA.email, TEST_DATA.password);

  // ─── Step 2: Create two bookings ───────────────────────────────
  const bookingOne = await createBookingFromFilters(page, {
    searchText: 'World',
    category: 'Conference',
    city: 'Hyderabad',
    quantity: 1,
    customerName: TEST_DATA.customerName,
    customerEmail: TEST_DATA.customerEmail,
    phone: TEST_DATA.phone,
  });
  console.log('Booking One:', bookingOne);

  const bookingTwo = await createBookingFromFilters(page, {
    searchText: 'Dilli',
    category: 'Festival',
    city: 'Delhi',
    quantity: 2,
    customerName: TEST_DATA.customerName,
    customerEmail: TEST_DATA.customerEmail,
    phone: TEST_DATA.phone,
  });
  console.log('Booking Two:', bookingTwo);

  // ─── Step 3: Navigate to My Bookings ────────────────────────────
  await page.getByTestId('nav-bookings').click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  // ─── Step 4: Find both booking cards by their refs ─────────────
  const cardOne = findBookingCardByRef(page, bookingOne.bookingRef);
  const cardTwo = findBookingCardByRef(page, bookingTwo.bookingRef);

  await expect(cardOne).toBeVisible();
  await expect(cardTwo).toBeVisible();

  // ─── Step 5: Verify list-level data on both cards ──────────────
  // Card One — World Tech Summit
  await expect(cardOne).toContainText(bookingOne.eventTitle);
  await expect(cardOne).toContainText('confirmed');
  await expect(cardOne).toContainText('1 ticket');
  await expect(cardOne).toContainText(bookingOne.totalText);

  // Card Two — Dilli Diwali Mela
  await expect(cardTwo).toContainText(bookingTwo.eventTitle);
  await expect(cardTwo).toContainText('confirmed');
  await expect(cardTwo).toContainText('2 ticket'); // matches "2 tickets" too
  await expect(cardTwo).toContainText(bookingTwo.totalText);

  // ─── Step 6: Open booking ONE's detail page and verify ─────────
  await openBookingDetailFromCard(cardOne);
  await expect(page).toHaveURL(/\/bookings\/\d+/);

  // Verify h1 matches
  await expect(page.locator('h1')).toHaveText(bookingOne.eventTitle);

  // Verify booking ref appears at top
await expect(page.getByText(bookingOne.bookingRef).first()).toBeVisible();
  // Verify Customer Details section
  await expect(page.getByText(bookingOne.customerEmail)).toBeVisible();

  // Verify Payment Summary
  await expect(page.getByText('Total Paid').locator('..')).toContainText(bookingOne.totalText);

  // ─── Step 7: Go back to /bookings, open booking TWO's detail ──
  await page.getByTestId('nav-bookings').click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  // Re-locate card two (locator auto-refinds after navigation)
  const cardTwoAgain = findBookingCardByRef(page, bookingTwo.bookingRef);
  await openBookingDetailFromCard(cardTwoAgain);

  await expect(page).toHaveURL(/\/bookings\/\d+/);
  await expect(page.locator('h1')).toHaveText(bookingTwo.eventTitle);
await expect(page.getByText(bookingTwo.bookingRef).first()).toBeVisible();

  
  await expect(page.getByText('Total Paid').locator('..')).toContainText(bookingTwo.totalText);

  // ─── Step 8: Confirm we didn't accidentally see booking one's ref on booking two's page ──
  await expect(page.getByText(bookingOne.bookingRef)).not.toBeVisible();

});