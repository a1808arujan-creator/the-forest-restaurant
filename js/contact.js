
'use strict';


const STORAGE_KEY = 'forestPreorder';

const form = document.getElementById('reservation-form');
const submitButton = document.getElementById('reservation-submit');
const result = document.getElementById('reservation-result');

const preorderItems = document.getElementById('preorder-items');
const preorderTotal = document.getElementById('preorder-total');

const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const guestsInput = document.getElementById('guests');
const occasionInput = document.getElementById('occasion');
const messageInput = document.getElementById('message');

function loadCart() {
    try {
        const savedCart = JSON.parse(
            sessionStorage.getItem(STORAGE_KEY)
        );

        if (Array.isArray(savedCart)) {
            return savedCart.filter(function (item) {
                return item &&
                    typeof item.name === 'string' &&
                    Number.isFinite(item.price) &&
                    Number.isInteger(item.quantity) &&
                    item.price >= 0 &&
                    item.quantity > 0;
            });
        }
    } catch (error) {
        console.log('Could not load pre-order.');
    }

    return [];
}

const cart = loadCart();



function formatPrice(price) {
    return price.toLocaleString('en-US') + ' ₸';
}



function calculateTotal(items) {
    let total = 0;

    items.forEach(function (item) {
        total += item.price * item.quantity;
    });

    return total;
}



function displayPreorder() {
    preorderItems.replaceChildren();

    if (cart.length === 0) {
        const emptyMessage = document.createElement('p');

        emptyMessage.className = 'text-muted';
        emptyMessage.textContent =
            'No dishes selected. You can still reserve a table.';

        preorderItems.appendChild(emptyMessage);
        preorderTotal.textContent = '0 ₸';

        return;
    }

    cart.forEach(function (item) {
        const row = document.createElement('div');

        row.className =
            'd-flex justify-content-between gap-3 mb-2';

        const name = document.createElement('span');
        name.textContent = item.name + ' × ' + item.quantity;

        const price = document.createElement('strong');
        price.textContent = formatPrice(
            item.price * item.quantity
        );

        row.appendChild(name);
        row.appendChild(price);

        preorderItems.appendChild(row);
    });

    preorderTotal.textContent = formatPrice(
        calculateTotal(cart)
    );
}



function showError(input, message) {
    input.classList.add('is-invalid');

    let feedback = input.parentElement.querySelector(
        '.invalid-feedback'
    );

    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';

        input.parentElement.appendChild(feedback);
    }

    feedback.textContent = message;
}

// Clear validation error

function clearError(input) {
    input.classList.remove('is-invalid');

    const feedback = input.parentElement.querySelector(
        '.invalid-feedback'
    );

    if (feedback) {
        feedback.textContent = '';
    }
}

// Get today's date in local time

function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

// Validate reservation form

function validateForm() {
    const inputs = [
        nameInput,
        phoneInput,
        dateInput,
        timeInput,
        guestsInput
    ];

    inputs.forEach(clearError);

    let firstInvalid = null;

    function invalidate(input, message) {
        showError(input, message);

        if (!firstInvalid) {
            firstInvalid = input;
        }
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const guests = Number(guestsInput.value);

    // Name validation

    if (name.length < 2) {
        invalidate(
            nameInput,
            'Please enter your name (at least 2 characters).'
        );
    }

    // Phone validation

    const phoneDigits = phone.replace(/\D/g, '');

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        invalidate(
            phoneInput,
            'Please enter a valid phone number.'
        );
    }

    // Date validation

    if (!date) {
        invalidate(dateInput, 'Please select a date.');
    } else if (date < getToday()) {
        invalidate(
            dateInput,
            'Please choose today or a future date.'
        );
    }

    // Time validation

    if (!time) {
        invalidate(timeInput, 'Please select a time.');
    } else if (time < '11:00' || time > '23:00') {
        invalidate(
            timeInput,
            'Please select a time between 11:00 and 23:00.'
        );
    } else if (date === getToday()) {
        const now = new Date();

        const currentTime =
            String(now.getHours()).padStart(2, '0') +
            ':' +
            String(now.getMinutes()).padStart(2, '0');

        if (time <= currentTime) {
            invalidate(
                timeInput,
                'Please choose a future time.'
            );
        }
    }

    // Guests validation

    if (
        guestsInput.value.trim() === '' ||
        !Number.isInteger(guests) ||
        guests < 1 ||
        guests > 20
    ) {
        invalidate(
            guestsInput,
            'Please enter between 1 and 20 guests.'
        );
    }

    if (firstInvalid) {
        firstInvalid.focus();
        return false;
    }

    return true;
}

// Generate demonstration reference number

function generateReference() {
    const number = Math.floor(
        100000 + Math.random() * 900000
    );

    return 'FOREST-' + number;
}

// Display reservation confirmation

function submitReservation() {
    result.replaceChildren();

    if (!validateForm()) {
        result.className =
            'reservation-result mt-3 alert alert-danger';

        result.textContent =
            'Please correct the highlighted fields.';

        return;
    }

    const reference = generateReference();

    const confirmation = document.createElement('div');

    const heading = document.createElement('h3');
    heading.className = 'fs-5 mb-3';
    heading.textContent = 'Reservation Request Prepared!';

    const details = document.createElement('p');

    details.textContent =
        'Thank you, ' + nameInput.value.trim() + '! ' +
        'Your demonstration request is ready.';

    const referenceText = document.createElement('p');
    referenceText.textContent = 'Reference: ' + reference;

    const bookingDetails = document.createElement('p');

    bookingDetails.textContent =
        'Date: ' + dateInput.value +
        ' | Time: ' + timeInput.value +
        ' | Guests: ' + guestsInput.value;

    const occasionText = document.createElement('p');

    occasionText.textContent =
        'Occasion: ' +
        occasionInput.options[occasionInput.selectedIndex].text;

    const totalText = document.createElement('p');

    totalText.textContent =
        'Pre-order total: ' + formatPrice(
            calculateTotal(cart)
        );

    const notice = document.createElement('p');
    notice.className = 'small mb-0';

    notice.textContent =
        'This is a website demonstration. ' +
        'No real reservation or food order has been sent.';

    confirmation.appendChild(heading);
    confirmation.appendChild(details);
    confirmation.appendChild(referenceText);
    confirmation.appendChild(bookingDetails);
    confirmation.appendChild(occasionText);
    confirmation.appendChild(totalText);

    if (messageInput.value.trim()) {
        const requestText = document.createElement('p');

        requestText.textContent =
            'Special requests: ' + messageInput.value.trim();

        confirmation.appendChild(requestText);
    }

    confirmation.appendChild(notice);

    result.className =
        'reservation-result mt-3 alert alert-success';

    result.appendChild(confirmation);

    result.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

// Remove errors when user edits fields

const requiredInputs = [
    nameInput,
    phoneInput,
    dateInput,
    timeInput,
    guestsInput
];

requiredInputs.forEach(function (input) {
    input.addEventListener('input', function () {
        clearError(input);
    });
});

// Prevent accidental form submission

form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitReservation();
});

// Handle Send Request button

submitButton.addEventListener('click', submitReservation);

// Initialize page

dateInput.min = getToday();

displayPreorder();

console.log('Contact JavaScript connected!');
