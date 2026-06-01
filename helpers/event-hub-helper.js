const { expect } = require('@playwright/test');
const email = 'amulyavarma21@gmail.com'
const password = 'Test@123'

//this is the existing login function, going to modify this.
/*async function login(page){
 await page.goto('/login');
 await page.getByPlaceholder('you@email.com').fill(email);
 await page.getByLabel('Password').fill(password);
 await page.getByRole('button', {name:'Sign In'}).click();
 await expect(page.getByRole('link',{name: /browse events/i}).first()).toBeVisible();
 //await page.locator('a[href="/events"]').first().click();
}*/
async function login(page, email, password) {
    await page.goto('/login');
    await page.getByPlaceholder('you@email.com').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByTestId('logout-btn')).toBeVisible();
}
async function createBookingFromFilters(page, bookingData) {
    const {
        searchText,
        category,
        city,
        quantity,
        customerName,
        customerEmail,
        phone, } = bookingData;

    await page.getByTestId('nav-events').click();
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    page.getByPlaceholder(/Search events, venues…/).fill(searchText);
    await page.locator('select').first().selectOption(category);
    await page.locator('select').nth(1).selectOption(city);

    const cards = page.getByTestId('event-card');
    const matchingCards = cards.filter({ hasText: searchText });
    const matchingCard = matchingCards.first();
    await expect(page.getByTestId('event-card')).toHaveCount(1);
   /*await matchingCard.getByRole('link', { name: 'Book Now' }).click();
    await expect(page).toHaveURL(/events/);*/
    await matchingCard.getByRole('link', { name: 'Book Now' }).click();
    await expect(page).toHaveURL(/\/events\/\d+/);  // matches /events/3 (detail)
    /*for (let i = 1; i < quantity; i++) {
        await page.getByRole('button', { name: '+' }).click();
    }*/
    // DIAGNOSTIC — take a screenshot to see what page we're on
    await page.screenshot({ path: 'debug-before-plus.png', fullPage: true });

    for (let i = 1; i < quantity; i++) {
        await page.locator('#ticket-count + button').click();
    }

    /*await page.getByLabel('Full Name').fill(customerName);
    await page.getByLabel('Email').fill(customerEmail);
    await page.getByLabel('Phone Number').fill(phone);*/
    await page.getByPlaceholder('Your full name').fill(customerName);
    await page.getByPlaceholder('you@email.com').fill(customerEmail);
    await page.getByPlaceholder('+91 98765 43210').fill(phone);
    await page.getByRole('button', { name: 'Confirm Booking' }).click();
    await expect(page.getByText('Booking confirmed!')).toBeVisible();
    const eventTitle = await page.locator('h1').textContent();
    // keep adding comments 
    // Capture the booking reference and total
    const bookingRef = await page.locator('.booking-ref').textContent();
    const totalText = await page
        .locator('div.flex.justify-between')
        .filter({ hasText: 'Total' })
        .locator('span')
        .last()
        .textContent();
    console.log('Captured Booking Reference:', bookingRef);

    // Return everything the caller might need
    return {
        eventTitle,
        bookingRef,
        ticketCount: quantity,
        totalText,
        customerEmail,
    };
}



function getEventCards(page) {
    return page.getByTestId('event-card');
}
async function parseSeatCount(text) {
    return parseInt(text, 10);
}
function findBookingCardByRef(page, bookingRef) {
  return page.getByTestId('booking-card').filter({ hasText: bookingRef });
  
}
async function openBookingDetailFromCard(card) {
  await card.getByRole('button', { name: 'View Details' }).click();
}

module.exports = { login, getEventCards, parseSeatCount, createBookingFromFilters, findBookingCardByRef, openBookingDetailFromCard };